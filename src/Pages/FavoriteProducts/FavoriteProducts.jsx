// FavoriteProducts.jsx
import React, { useEffect, useState } from 'react';
import StaticSpinner from '../../Components/Spinners/StaticSpinner';
import { useGet } from '../../Hooks/useGet';
import { useSelector } from 'react-redux';
import ProductCard from '../../Components/ProductCard';

const FavoriteProducts = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const selectedLanguage = useSelector((state) => state.language?.selected ?? 'en');
  const token = useSelector(state => state?.user?.data?.token || '');
  
  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [error, setError] = useState(null);

  const {
    refetch: refetchFavorites,
    loading: apiLoading,
    data: dataFavorites,
    error: apiError
  } = useGet({
    url: `${apiUrl}/customer/home/fav_products?locale=${selectedLanguage}`,
  });

  // Refetch when language changes
  useEffect(() => {
    if (token) { // Only fetch if user is logged in
      refetchFavorites();
    }
  }, [selectedLanguage, refetchFavorites, token]);

  // Update favorites data
  useEffect(() => {
    setLoadingFavorites(apiLoading);
    if (apiError) {
      setError('Failed to load favorites. Please try again.');
      console.error('Favorites API error:', apiError);
    } else if (dataFavorites && dataFavorites.products) {
      setFavorites(dataFavorites.products);
      setError(null);
    } else if (!token) {
      setFavorites([]);
      setError(null);
    }
  }, [dataFavorites, apiLoading, apiError, token]);

  // Handle favorite toggle (remove from favorites list)
  const handleFavoriteToggle = (product, newFavoriteState) => {
    if (!newFavoriteState) {
      // Remove from local state when unfavorited
      setFavorites(prev => prev.filter(p => p.id !== product.id));
    }
  };

  if (loadingFavorites) {
    return (
      <div className="flex justify-center items-center py-12">
        <StaticSpinner />
      </div>
    );
  }

  if (error && !token) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-gray-500 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites</h3>
        <p className="text-gray-500 mb-4">Please log in to see your favorite products.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={() => refetchFavorites()}
          className="px-4 py-2 bg-mainColor text-white rounded-lg hover:bg-mainColor/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-mainColor mb-2">My Favorites</h1>
          <p className="text-gray-600">
            {favorites.length > 0 
              ? `${favorites.length} item${favorites.length !== 1 ? 's' : ''} in your favorites` 
              : 'No favorites yet. Start adding items you love!'
            }
          </p>
        </div>

        {/* Products Grid */}
        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {favorites.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorite={true}
                onFavoriteToggle={handleFavoriteToggle}
                language={selectedLanguage}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
            <p className="text-gray-500 mb-6">Start adding items you love to your favorites list.</p>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2 bg-mainColor text-white rounded-lg hover:bg-mainColor/90 transition-colors"
            >
              Browse Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoriteProducts;