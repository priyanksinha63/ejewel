import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Filter, X, ChevronDown } from 'lucide-react';
import { productsApi } from '../api/products';
import { ProductGrid } from '../components/product/ProductGrid';
import { Button } from '../components/ui/Button';
import type { ProductFilter } from '../types';

export const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [filters, setFilters] = useState<ProductFilter>({
    metalType: searchParams.get('metalType') || '',
    categoryId: searchParams.get('categoryId') || '',
    minPrice: Number(searchParams.get('minPrice')) || undefined,
    maxPrice: Number(searchParams.get('maxPrice')) || undefined,
    purity: searchParams.get('purity') || '',
    search: searchParams.get('search') || '',
    isFeatured: searchParams.get('isFeatured') || '',
    sortBy: searchParams.get('sortBy') || 'newest',
    sortOrder: searchParams.get('sortOrder') || 'desc',
    page: Number(searchParams.get('page')) || 1,
    limit: 12,
  });

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsApi.getProducts(filters),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productsApi.getCategories(),
  });

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '' && key !== 'limit') {
        params.set(key, String(value));
      }
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleFilterChange = (key: keyof ProductFilter, value: string | number | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      metalType: '',
      categoryId: '',
      minPrice: undefined,
      maxPrice: undefined,
      purity: '',
      search: '',
      isFeatured: '',
      sortBy: 'newest',
      sortOrder: 'desc',
      page: 1,
      limit: 12,
    });
  };

  const metalTypes = [
    { value: '', label: 'All Metals' },
    { value: 'gold', label: 'Gold' },
    { value: 'silver', label: 'Silver' },
    { value: 'platinum', label: 'Platinum' },
    { value: 'rose_gold', label: 'Rose Gold' },
  ];

  const purities = [
    { value: '', label: 'All Purities' },
    { value: '24K', label: '24K Gold' },
    { value: '22K', label: '22K Gold' },
    { value: '18K', label: '18K Gold' },
    { value: '925 Sterling', label: '925 Sterling Silver' },
    { value: '950 Platinum', label: '950 Platinum' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' },
    { value: 'name', label: 'Name: A-Z' },
  ];

  const activeFiltersCount = [
    filters.metalType,
    filters.categoryId,
    filters.purity,
    filters.minPrice,
    filters.maxPrice,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-4xl font-bold text-cream-50 mb-2">
            {filters.search ? `Search: "${filters.search}"` : 'Our Collection'}
          </h1>
          <p className="text-charcoal-400">
            {productsData?.total || 0} products found
          </p>
        </motion.div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-4 bg-charcoal-800/30 rounded-xl border border-charcoal-700">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-charcoal-700/50 rounded-lg text-cream-100 hover:bg-charcoal-700 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 bg-gold-500 text-charcoal-900 text-xs font-bold rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-charcoal-400 hover:text-gold-500 transition-colors text-sm"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-charcoal-400 text-sm">Sort by:</span>
            <div className="relative">
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, order] = e.target.value.split('-');
                  setFilters((prev) => ({
                    ...prev,
                    sortBy: sortBy || 'newest',
                    sortOrder: order || 'desc',
                  }));
                }}
                className="appearance-none pl-4 pr-10 py-2 bg-charcoal-700/50 rounded-lg text-cream-100 focus:outline-none focus:ring-2 focus:ring-gold-500/30 cursor-pointer"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value === 'price-asc' ? 'price-asc' : option.value === 'price-desc' ? 'price-desc' : `${option.value}-desc`}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 p-6 bg-charcoal-800/30 rounded-xl border border-charcoal-700"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Metal Type */}
              <div>
                <label className="block text-cream-200 text-sm font-medium mb-2">
                  Metal Type
                </label>
                <select
                  value={filters.metalType}
                  onChange={(e) => handleFilterChange('metalType', e.target.value)}
                  className="w-full px-4 py-3 bg-charcoal-700/50 border border-charcoal-600 rounded-lg text-cream-100 focus:outline-none focus:border-gold-500"
                >
                  {metalTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-cream-200 text-sm font-medium mb-2">
                  Category
                </label>
                <select
                  value={filters.categoryId}
                  onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                  className="w-full px-4 py-3 bg-charcoal-700/50 border border-charcoal-600 rounded-lg text-cream-100 focus:outline-none focus:border-gold-500"
                >
                  <option value="">All Categories</option>
                  {categories?.data?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Purity */}
              <div>
                <label className="block text-cream-200 text-sm font-medium mb-2">
                  Purity
                </label>
                <select
                  value={filters.purity}
                  onChange={(e) => handleFilterChange('purity', e.target.value)}
                  className="w-full px-4 py-3 bg-charcoal-700/50 border border-charcoal-600 rounded-lg text-cream-100 focus:outline-none focus:border-gold-500"
                >
                  {purities.map((purity) => (
                    <option key={purity.value} value={purity.value}>
                      {purity.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-cream-200 text-sm font-medium mb-2">
                  Price Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice || ''}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                    className="w-1/2 px-3 py-3 bg-charcoal-700/50 border border-charcoal-600 rounded-lg text-cream-100 focus:outline-none focus:border-gold-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice || ''}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                    className="w-1/2 px-3 py-3 bg-charcoal-700/50 border border-charcoal-600 rounded-lg text-cream-100 focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Active Filter Tags */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {filters.metalType && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gold-500/20 text-gold-500 rounded-full text-sm">
                {metalTypes.find((m) => m.value === filters.metalType)?.label}
                <button onClick={() => handleFilterChange('metalType', '')}>
                  <X className="w-4 h-4" />
                </button>
              </span>
            )}
            {filters.categoryId && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gold-500/20 text-gold-500 rounded-full text-sm">
                {categories?.data?.find((c) => c.id === filters.categoryId)?.name}
                <button onClick={() => handleFilterChange('categoryId', '')}>
                  <X className="w-4 h-4" />
                </button>
              </span>
            )}
            {filters.purity && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gold-500/20 text-gold-500 rounded-full text-sm">
                {filters.purity}
                <button onClick={() => handleFilterChange('purity', '')}>
                  <X className="w-4 h-4" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Products Grid */}
        <ProductGrid products={productsData?.data || []} isLoading={isLoading} />

        {/* Pagination */}
        {productsData && productsData.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <Button
              variant="ghost"
              disabled={filters.page === 1}
              onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))}
            >
              Previous
            </Button>
            
            {[...Array(productsData.totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setFilters((prev) => ({ ...prev, page: i + 1 }))}
                className={`w-10 h-10 rounded-lg font-medium transition-all ${
                  filters.page === i + 1
                    ? 'bg-gold-500 text-charcoal-900'
                    : 'text-charcoal-400 hover:text-gold-500 hover:bg-charcoal-800'
                }`}
              >
                {i + 1}
              </button>
            ))}

            <Button
              variant="ghost"
              disabled={filters.page === productsData.totalPages}
              onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

