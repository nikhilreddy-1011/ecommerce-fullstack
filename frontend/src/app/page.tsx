'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown, Star } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { useProducts, ProductFilters } from '@/hooks/useProducts';
import api from '@/lib/axios';

interface Category { _id: string; name: string; slug: string; }

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest First' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating_desc', label: 'Top Rated' },
    { value: 'price_asc', label: 'Price: Low → High' },
    { value: 'price_desc', label: 'Price: High → Low' },
];

export default function ProductsPage() {
    const { products, meta, isLoading, fetchProducts } = useProducts();
    const [categories, setCategories] = useState<Category[]>([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [filters, setFilters] = useState<ProductFilters>({
        sortBy: 'newest',
        page: 1,
        limit: 12,
    });
    const [searchInput, setSearchInput] = useState('');

    useEffect(() => {
        api.get('/categories').then(({ data }) => setCategories(data.data.categories)).catch(() => { });
    }, []);

    const applyFilters = useCallback(
        (newFilters: ProductFilters) => {
            setFilters(newFilters);
            fetchProducts(newFilters);
        },
        [fetchProducts]
    );

    useEffect(() => {
        fetchProducts(filters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters({ ...filters, search: searchInput, page: 1 });
    };

    const handleCategoryFilter = (categoryId: string) => {
        const updated = { ...filters, category: categoryId || undefined, page: 1 };
        applyFilters(updated);
    };

    const handleSortChange = (sortBy: ProductFilters['sortBy']) => {
        applyFilters({ ...filters, sortBy, page: 1 });
    };

    const handlePriceRange = (minPrice?: number, maxPrice?: number) => {
        applyFilters({ ...filters, minPrice, maxPrice, page: 1 });
    };

    const handleRatingFilter = (minRating: number) => {
        applyFilters({ ...filters, minRating, page: 1 });
    };

    const clearFilters = () => {
        setSearchInput('');
        applyFilters({ sortBy: 'newest', page: 1, limit: 12 });
    };

    const hasActiveFilters =
        filters.search || filters.category || filters.minPrice || filters.maxPrice || filters.minRating;

    const FilterSidebar = () => (
        <aside className="w-full space-y-6">
            {/* Categories */}
            <div>
                <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">Categories</h3>
                <div className="space-y-1">
                    <button
                        onClick={() => handleCategoryFilter('')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!filters.category ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`}
                    >
                        All Categories
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat._id}
                            onClick={() => handleCategoryFilter(cat._id)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filters.category === cat._id
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div>
                <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">Price Range</h3>
                <div className="space-y-2">
                    {[
                        { label: 'Under ₹500', min: 0, max: 500 },
                        { label: '₹500 – ₹2,000', min: 500, max: 2000 },
                        { label: '₹2,000 – ₹10,000', min: 2000, max: 10000 },
                        { label: 'Above ₹10,000', min: 10000, max: undefined },
                    ].map(({ label, min, max }) => (
                        <button
                            key={label}
                            onClick={() => handlePriceRange(min, max)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filters.minPrice === min && filters.maxPrice === max
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Rating */}
            <div>
                <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">Min Rating</h3>
                <div className="space-y-2">
                    {[4, 3, 2].map((rating) => (
                        <button
                            key={rating}
                            onClick={() => handleRatingFilter(rating)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${filters.minRating === rating
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <Star size={13} className="fill-amber-400 text-amber-400" />
                            {rating}+ Stars
                        </button>
                    ))}
                </div>
            </div>

            {hasActiveFilters && (
                <button
                    onClick={clearFilters}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg text-sm transition-colors"
                >
                    <X size={14} /> Clear All Filters
                </button>
            )}
        </aside>
    );

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            {/* Header */}
            <div className="border-b border-gray-800 bg-gray-900/60 backdrop-blur sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                    {/* Search */}
                    <form onSubmit={handleSearch} className="flex-1 max-w-xl flex gap-2">
                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-600"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors"
                        >
                            Search
                        </button>
                    </form>

                    <div className="flex items-center gap-3">
                        {/* Sort */}
                        <div className="relative">
                            <select
                                value={filters.sortBy}
                                onChange={(e) => handleSortChange(e.target.value as ProductFilters['sortBy'])}
                                className="appearance-none bg-gray-800 border border-gray-700 text-white rounded-xl pl-3 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                            >
                                {SORT_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        </div>

                        {/* Mobile filter toggle */}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden flex items-center gap-2 px-3 py-2.5 bg-gray-800 border border-gray-700 hover:border-indigo-500 rounded-xl text-sm text-gray-300 hover:text-white transition-colors"
                        >
                            <SlidersHorizontal size={15} />
                            Filters
                            {hasActiveFilters && <span className="w-2 h-2 bg-indigo-500 rounded-full" />}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
                {/* Desktop Sidebar */}
                <div className="hidden lg:block w-56 flex-shrink-0">
                    <FilterSidebar />
                </div>

                {/* Mobile Sidebar Drawer */}
                {sidebarOpen && (
                    <div className="lg:hidden fixed inset-0 z-50 flex">
                        <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
                        <div className="relative ml-auto w-72 h-full bg-gray-900 border-l border-gray-800 p-6 overflow-y-auto">
                            <div className="flex justify-between items-center mb-5">
                                <h2 className="text-white font-semibold">Filters</h2>
                                <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>
                            <FilterSidebar />
                        </div>
                    </div>
                )}

                {/* Product Grid */}
                <div className="flex-1 min-w-0">
                    {/* Result count */}
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-gray-400">
                            {isLoading ? 'Loading...' : `${meta.total} product${meta.total !== 1 ? 's' : ''} found`}
                        </p>
                        {hasActiveFilters && (
                            <button onClick={clearFilters} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                                <X size={12} /> Clear filters
                            </button>
                        )}
                    </div>

                    {/* Skeleton loaders */}
                    {isLoading && (
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden animate-pulse">
                                    <div className="aspect-square bg-gray-800" />
                                    <div className="p-4 space-y-2">
                                        <div className="h-3 bg-gray-800 rounded w-1/3" />
                                        <div className="h-4 bg-gray-800 rounded w-full" />
                                        <div className="h-4 bg-gray-800 rounded w-3/4" />
                                        <div className="h-5 bg-gray-800 rounded w-1/2 mt-2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty state */}
                    {!isLoading && products.length === 0 && (
                        <div className="text-center py-24">
                            <p className="text-5xl mb-4">🔍</p>
                            <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
                            <p className="text-gray-400 text-sm">Try adjusting your filters or search terms.</p>
                            <button onClick={clearFilters} className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-xl transition-colors">
                                Clear Filters
                            </button>
                        </div>
                    )}

                    {/* Products */}
                    {!isLoading && products.length > 0 && (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                {products.map((product) => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {meta.totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 mt-8">
                                    <button
                                        disabled={meta.page <= 1}
                                        onClick={() => applyFilters({ ...filters, page: meta.page - 1 })}
                                        className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-xl text-sm disabled:opacity-40 hover:bg-gray-700 transition-colors disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm text-gray-400">
                                        Page {meta.page} of {meta.totalPages}
                                    </span>
                                    <button
                                        disabled={meta.page >= meta.totalPages}
                                        onClick={() => applyFilters({ ...filters, page: meta.page + 1 })}
                                        className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-xl text-sm disabled:opacity-40 hover:bg-gray-700 transition-colors disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
