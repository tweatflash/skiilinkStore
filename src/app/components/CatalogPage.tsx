import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ArrowLeft, Filter, Grid, List, SortAsc, Search, X } from 'lucide-react';
import ProductCard from './ProductCard';
import { Product, Category } from '../types/product';
import { categories, featuredProducts, bestSellingProducts } from '../data/products';

interface CatalogPageProps {
  onBack: () => void;
  onAddToCart: (product: Product) => void;
  onProductClick?: (product: Product) => void;
  searchQuery?: string;
  selectedCategory?: string | null;
}

// Simulate more products for infinite scroll
const generateMoreProducts = (baseProducts: Product[], count: number): Product[] => {
  const moreProducts: Product[] = [];
  for (let i = 0; i < count; i++) {
    const baseProduct = baseProducts[i % baseProducts.length];
    moreProducts.push({
      ...baseProduct,
      id: `${baseProduct.id}-${i + 100}`,
      name: `${baseProduct.name} - Model ${String.fromCharCode(65 + (i % 26))}`,
      price: baseProduct.price + (Math.random() * 200000 - 100000),
      rating: 3.5 + Math.random() * 1.5,
      reviews: Math.floor(Math.random() * 500) + 10,
    });
  }
  return moreProducts;
};

const allProducts = [...featuredProducts, ...bestSellingProducts];
const extendedProducts = [...allProducts, ...generateMoreProducts(allProducts, 200)];

const CatalogPage: React.FC<CatalogPageProps> = ({ 
  onBack, 
  onAddToCart, 
  onProductClick,
  searchQuery = '', 
  selectedCategory = null 
}) => {
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentCategory, setCurrentCategory] = useState<string | null>(selectedCategory);
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high' | 'rating'>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);

  const PRODUCTS_PER_LOAD = 12;

  const filteredProducts = useMemo(() => {
    let filtered = extendedProducts;

    // Filter by search query
    if (localSearchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(localSearchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (currentCategory) {
      filtered = filtered.filter(product => product.category === currentCategory);
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return filtered;
  }, [localSearchQuery, currentCategory, sortBy]);

  const loadMoreProducts = useCallback(() => {
    if (loading || !hasMore) return;

    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const currentLength = displayedProducts.length;
      const nextProducts = filteredProducts.slice(currentLength, currentLength + PRODUCTS_PER_LOAD);
      
      if (nextProducts.length === 0) {
        setHasMore(false);
      } else {
        setDisplayedProducts(prev => [...prev, ...nextProducts]);
      }
      
      setLoading(false);
    }, 500);
  }, [displayedProducts.length, filteredProducts, loading, hasMore]);

  // Reset displayed products when filters change
  useEffect(() => {
    setDisplayedProducts(filteredProducts.slice(0, PRODUCTS_PER_LOAD));
    setHasMore(filteredProducts.length > PRODUCTS_PER_LOAD);
  }, [filteredProducts]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000
      ) {
        loadMoreProducts();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMoreProducts]);

  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || categoryId;
  };

  const getProductCount = (categoryId: string) => {
    return filteredProducts.filter(product => product.category === categoryId).length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Mobile Header */}
          <div className="flex items-center justify-between lg:hidden">
            <div className="flex items-center space-x-3">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="text-sm">Back</span>
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900 truncate">
                  {currentCategory ? getCategoryName(currentCategory) : 'All Products'}
                </h1>
                <span className="text-xs text-gray-500">
                  {filteredProducts.length} products
                </span>
              </div>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-3 py-2 bg-orange-500 text-white rounded-lg"
            >
              <Filter size={16} />
              <span className="text-sm">Filters</span>
            </button>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Back</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {currentCategory ? getCategoryName(currentCategory) : 'All Products'}
              </h1>
              <span className="text-gray-500">
                ({filteredProducts.length} products)
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  className="w-64 px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                {localSearchQuery && (
                  <button
                    onClick={() => setLocalSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>

              {/* View Mode */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600'}`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600'}`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Filters Panel */}
          {showFilters && (
            <div className="lg:hidden mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                {localSearchQuery && (
                  <button
                    onClick={() => setLocalSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Mobile Sort and View */}
              <div className="flex space-x-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>

                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600'}`}
                  >
                    <Grid size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600'}`}
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto py-4 scrollbar-hide">
            <button
              onClick={() => setCurrentCategory(null)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors text-sm font-medium ${
                !currentCategory
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Products ({filteredProducts.length})
            </button>
            {categories.map((category) => {
              const count = getProductCount(category.id);
              return (
                <button
                  key={category.id}
                  onClick={() => setCurrentCategory(category.id)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors text-sm font-medium ${
                    currentCategory === category.id
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {displayedProducts.length === 0 && !loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
            <button
              onClick={() => {
                setLocalSearchQuery('');
                setCurrentCategory(null);
              }}
              className="mt-4 text-orange-500 hover:text-orange-600 underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <div className={`grid  ${
              viewMode === 'grid' 
                ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5' 
                : 'grid-cols-1'
            }`}>
              {displayedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                  onProductClick={onProductClick}
                  viewMode={viewMode}
                />
              ))}
            </div>

            {/* Loading Indicator */}
            {loading && (
              <div className="text-center py-8">
                <div className="inline-flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                  <span className="text-gray-600">Loading more products...</span>
                </div>
              </div>
            )}

            {/* End of Results */}
            {!hasMore && displayedProducts.length > 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">You've reached the end of our catalog!</p>
                <p className="text-sm text-gray-400 mt-2">
                  Showing all {displayedProducts.length} products
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CatalogPage;