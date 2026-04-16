export interface Product {
    _id?: string;
    title: string;
    brand: string;
    description: string;
    section: string;
    category: string;
    sub_category: string;
    tags: string[];
    price: string;
    color: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface SearchFilters {
    section?: string;
    category?: string;
    sub_category?: string;
    brand?: string;
    color?: string;
    minPrice?: number;
    maxPrice?: number;
    tags?: string[];
}

export interface SearchOptions {
    page?: number;
    limit?: number;
    sort?: 'relevance' | 'price_asc' | 'price_desc';
}

export interface SearchResponse {
    total: number;
    page: number;
    limit: number;
    results: any[];
    facets: {
        brands: any[];
        categories: any[];
        sections: any[];
        colors: any[];
        sub_categories: any[];
        price_ranges: any[];
    };
}

export interface ProductListResponse {
    total: number;
    page: number;
    limit: number;
    results: Product[];
}

export interface FiltersResponse {
    sections: string[];
    categories: string[];
    brands: string[];
    colors: string[];
}
