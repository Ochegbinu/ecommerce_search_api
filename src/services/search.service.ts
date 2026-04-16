import { esClient } from '../config/elasticsearch.js';
import type { Product, SearchFilters, SearchOptions, SearchResponse } from '../types/index.js';

export const PRODUCT_INDEX = 'products';

export const createProductIndex = async () => {
    const exists = await esClient.indices.exists({ index: PRODUCT_INDEX });

    if (!exists) {
        await esClient.indices.create({
            index: PRODUCT_INDEX,
            settings: {
                analysis: {
                    analyzer: {
                        autocomplete_analyzer: {
                            type: 'custom',
                            tokenizer: 'autocomplete_tokenizer',
                            filter: ['lowercase'],
                        },
                    },
                    tokenizer: {
                        autocomplete_tokenizer: {
                            type: 'edge_ngram',
                            min_gram: 1,
                            max_gram: 20,
                            token_chars: ['letter', 'digit'],
                        },
                    },
                },
            },
            mappings: {
                properties: {
                    title: {
                        type: 'text',
                        fields: {
                            autocomplete: {
                                type: 'text',
                                analyzer: 'autocomplete_analyzer',
                                search_analyzer: 'standard',
                            },
                        },
                    },
                    brand: { type: 'keyword' },
                    description: { type: 'text' },
                    section: { type: 'keyword' },
                    category: { type: 'keyword' },
                    sub_category: { type: 'keyword' },
                    tags: { type: 'keyword' },
                    price_val: { type: 'float' },
                    color: { type: 'keyword' },
                },
            },
        });
        console.log(`Elasticsearch index '${PRODUCT_INDEX}' created.`);
    } else {
        console.log(`Elasticsearch index '${PRODUCT_INDEX}' already exists.`);
    }
};

export const indexProduct = async (product: Product) => {
    // Basic price extraction for filtering if needed
    const priceVal = parseFloat(product.price?.replace(/[^0-9.]/g, '') || '0');

    const { _id, ...productWithoutId } = product;

    await esClient.index({
        index: PRODUCT_INDEX,
        id: _id!,
        document: {
            ...productWithoutId,
            price_val: priceVal,
        },
    });
};

export const searchProducts = async (
    query: string,
    filters: SearchFilters = {},
    options: SearchOptions = {}
): Promise<SearchResponse> => {
    const { page = 1, limit = 20, sort = 'relevance' } = options;
    const from = (page - 1) * limit;

    // Build filter clauses
    const filterClauses: any[] = [];
    
    if (filters.section) filterClauses.push({ term: { section: filters.section } });
    if (filters.category) filterClauses.push({ term: { category: filters.category } });
    if (filters.sub_category) filterClauses.push({ term: { sub_category: filters.sub_category } });
    if (filters.brand) filterClauses.push({ term: { brand: filters.brand } });
    if (filters.color) filterClauses.push({ term: { color: filters.color } });
    if (filters.tags && filters.tags.length > 0) {
        filterClauses.push({ terms: { tags: filters.tags } });
    }
    if (filters.minPrice || filters.maxPrice) {
        filterClauses.push({
            range: {
                price_val: {
                    ...(filters.minPrice && { gte: filters.minPrice }),
                    ...(filters.maxPrice && { lte: filters.maxPrice }),
                },
            },
        });
    }

    // Build query with boosting for priority
    const mustQuery = {
        bool: {
            should: [
                // Exact phrase match gets highest boost
                { match_phrase: { title: { query: query, boost: 5 } } },
                { match_phrase: { description: { query: query, boost: 3 } } },
                
                // Multi-field search with individual boosts
                { match: { title: { query: query, boost: 4, fuzziness: 'AUTO' } } },
                { match: { category: { query: query, boost: 3 } } },
                { match: { tags: { query: query, boost: 2.5 } } },
                { match: { brand: { query: query, boost: 2 } } },
                { match: { description: { query: query, boost: 1, fuzziness: 'AUTO' } } },
            ],
            minimum_should_match: 1,
        },
    };

    // Build sort options
    let sortOptions: any[] = [];
    if (sort === 'price_asc') {
        sortOptions = [{ price_val: 'asc' }];
    } else if (sort === 'price_desc') {
        sortOptions = [{ price_val: 'desc' }];
    } else {
        sortOptions = ['_score']; // relevance
    }

    const result = await esClient.search({
        index: PRODUCT_INDEX,
        from,
        size: limit,
        query: {
            bool: {
                must: mustQuery,
                filter: filterClauses,
            },
        },
        sort: sortOptions,
        aggs: {
            brands: { terms: { field: 'brand', size: 50 } },
            categories: { terms: { field: 'category', size: 50 } },
            sections: { terms: { field: 'section', size: 20 } },
            colors: { terms: { field: 'color', size: 30 } },
            sub_categories: { terms: { field: 'sub_category', size: 50 } },
            price_ranges: {
                range: {
                    field: 'price_val',
                    ranges: [
                        { key: '0-100', to: 100 },
                        { key: '100-500', from: 100, to: 500 },
                        { key: '500-1000', from: 500, to: 1000 },
                        { key: '1000+', from: 1000 },
                    ],
                },
            },
        },
    });

    return {
        total: typeof result.hits.total === 'object' ? (result.hits.total.value ?? 0) : (result.hits.total ?? 0),
        page,
        limit,
        results: result.hits.hits.map(hit => ({
            ...(hit._source as any),
            _score: hit._score,
        })),
        facets: {
            brands: (result.aggregations?.brands as any)?.buckets || [],
            categories: (result.aggregations?.categories as any)?.buckets || [],
            sections: (result.aggregations?.sections as any)?.buckets || [],
            colors: (result.aggregations?.colors as any)?.buckets || [],
            sub_categories: (result.aggregations?.sub_categories as any)?.buckets || [],
            price_ranges: (result.aggregations?.price_ranges as any)?.buckets || [],
        },
    };
};

export const getSuggestions = async (query: string) => {
    const result = await esClient.search({
        index: PRODUCT_INDEX,
        query: {
            bool: {
                should: [
                    { match: { 'title.autocomplete': { query: query, boost: 3 } } },
                    { match: { category: { query: query, boost: 2, fuzziness: 'AUTO' } } },
                    { match: { tags: { query: query, boost: 1.5 } } },
                ],
                minimum_should_match: 1,
            },
        },
        size: 10,
        _source: ['title', 'category', 'tags', 'brand', 'sub_category'],
    });
    
    // Generate meaningful suggestions combining multiple attributes
    const suggestionSet = new Set<string>();
    
    result.hits.hits.forEach((hit: any) => {
        const product = hit._source;
        
        // Add product title
        suggestionSet.add(product.title);
        
        // Add category-based suggestions
        if (product.category) {
            suggestionSet.add(product.category);
            
            // Combine with tags for richer suggestions
            if (product.tags && Array.isArray(product.tags)) {
                product.tags.slice(0, 2).forEach((tag: string) => {
                    suggestionSet.add(`${tag} ${product.category}`);
                    suggestionSet.add(`${product.category} ${tag}`);
                });
            }
            
            // Add sub-category variations
            if (product.sub_category) {
                suggestionSet.add(`${product.category} ${product.sub_category}`);
            }
            
            // Add brand variations
            if (product.brand) {
                suggestionSet.add(`${product.brand} ${product.category}`);
            }
        }
    });
    
    // Filter suggestions that match the query and limit results
    const filteredSuggestions = Array.from(suggestionSet)
        .filter(s => s.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 8);
    
    return filteredSuggestions;
};

// Spell correction - "Did you mean?" feature
export const getSpellingSuggestions = async (query: string) => {
    const result = await esClient.search({
        index: PRODUCT_INDEX,
        suggest: {
            text: query,
            simple_phrase: {
                phrase: {
                    field: 'title',
                    size: 3,
                    gram_size: 3,
                    direct_generator: [
                        {
                            field: 'title',
                            suggest_mode: 'always',
                            min_word_length: 3,
                        },
                    ],
                    highlight: {
                        pre_tag: '<em>',
                        post_tag: '</em>',
                    },
                },
            },
        },
        size: 0,
    });

    const suggestions = (result.suggest?.simple_phrase?.[0]?.options as any[]) || [];
    return suggestions.map((s: any) => s.text);
};
