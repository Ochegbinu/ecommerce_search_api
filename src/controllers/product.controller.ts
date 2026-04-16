import type { Request, Response } from 'express';
import { getDb } from '../config/mongodb.js';
import { indexProduct, searchProducts, getSuggestions, getSpellingSuggestions } from '../services/search.service.js';
import type { Product, SearchFilters, SearchOptions } from '../types/index.js';

export const addProduct = async (req: Request, res: Response) => {
    try {
        const db = getDb();
        const productData: Product = req.body;
        
        const { _id, ...rest } = productData;
        const result = await db.collection('products').insertOne({
            ...rest,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const product: Product = {
            ...productData,
            _id: result.insertedId.toString(),
        };

        // Sync with Elasticsearch
        await indexProduct(product);

        res.status(201).json(product);
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const search = async (req: Request, res: Response) => {
    try {
        const query = req.query.q as string;
        if (!query) {
            res.status(400).json({ error: 'Search query is required' });
            return;
        }

        // Extract filters from query parameters
        const filters = {
            section: req.query.section as string,
            category: req.query.category as string,
            sub_category: req.query.sub_category as string,
            brand: req.query.brand as string,
            color: req.query.color as string,
            minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
            maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
            tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
        };

        // Extract pagination and sort options
        const options = {
            page: req.query.page ? parseInt(req.query.page as string) : 1,
            limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
            sort: (req.query.sort as 'relevance' | 'price_asc' | 'price_desc') || 'relevance',
        };

        const results = await searchProducts(query, filters, options);
        
        // Get spell suggestions if query might be misspelled
        let didYouMean: string[] = [];
        if (results.total === 0) {
            didYouMean = await getSpellingSuggestions(query);
        }

        res.json({
            query,
            ...results,
            didYouMean: didYouMean.length > 0 ? didYouMean : undefined,
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const suggest = async (req: Request, res: Response) => {
    try {
        const query = req.query.q as string;
        if (!query) {
            res.status(400).json({ error: 'Suggestion query is required' });
            return;
        }

        const suggestions = await getSuggestions(query);
        res.json(suggestions);
    } catch (error) {
        console.error('Suggestion error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const db = getDb();
        const page = req.query.page ? parseInt(req.query.page as string) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
        const skip = (page - 1) * limit;

        const [products, total] = await Promise.all([
            db.collection('products').find({}).skip(skip).limit(limit).toArray(),
            db.collection('products').countDocuments(),
        ]);

        res.json({
            total,
            page,
            limit,
            results: products,
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getFilters = async (req: Request, res: Response) => {
    try {
        const db = getDb();
        
        const [sections, categories, brands, colors] = await Promise.all([
            db.collection('products').distinct('section'),
            db.collection('products').distinct('category'),
            db.collection('products').distinct('brand'),
            db.collection('products').distinct('color'),
        ]);

        res.json({
            sections,
            categories,
            brands,
            colors,
        });
    } catch (error) {
        console.error('Error fetching filters:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
