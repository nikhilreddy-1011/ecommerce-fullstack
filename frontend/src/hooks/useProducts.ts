import { useState, useCallback } from 'react';
import api from '@/lib/axios';
import { IProduct } from '@/types';

export interface ProductFilters {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    sortBy?: 'price_asc' | 'price_desc' | 'rating_desc' | 'newest' | 'popular';
    page?: number;
    limit?: number;
}

interface ProductsResponse {
    products: IProduct[];
    total: number;
    page: number;
    totalPages: number;
    limit: number;
}

export const useProducts = () => {
    const [products, setProducts] = useState<IProduct[]>([]);
    const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1, limit: 12 });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = useCallback(async (filters: ProductFilters = {}) => {
        setIsLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, val]) => {
                if (val !== undefined && val !== '') params.append(key, String(val));
            });
            const { data } = await api.get<{ data: ProductsResponse }>(`/products?${params}`);
            setProducts(data.data.products);
            setMeta({
                total: data.data.total,
                page: data.data.page,
                totalPages: data.data.totalPages,
                limit: data.data.limit,
            });
        } catch (err: unknown) {
            setError((err as Error).message || 'Failed to fetch products');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchProductBySlug = useCallback(async (slug: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await api.get(`/products/detail/${slug}`);
            return data.data;
        } catch (err: unknown) {
            setError((err as Error).message || 'Product not found');
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { products, meta, isLoading, error, fetchProducts, fetchProductBySlug };
};
