import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import StaticSpinner from '../../../Components/Spinners/StaticSpinner';
import { ChevronLeft, ChevronRight, Play, Pause, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGet } from '../../../Hooks/useGet';
import ProductDetails from '../../Products/ProductDetails';

const OffersProducts = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const selectedLanguage = useSelector((state) => state.language?.selected ?? 'en');
  const dispatch = useDispatch();
  const scrollContainerRef = useRef(null);
  const autoScrollRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [offerProductsData, setOfferProductsData] = useState(null);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const {
    refetch: refetchOfferProducts,
    loading: loadingOfferProducts,
    data: dataOfferProducts,
  } = useGet({
    url: `${apiUrl}/customer/home/discount_product?&locale=${selectedLanguage}`,
  });

  // Refetch products when language changes
  useEffect(() => {
    refetchOfferProducts();
  }, [selectedLanguage, refetchOfferProducts]);

  // Store the data in state
  useEffect(() => {
    if (dataOfferProducts && !loadingOfferProducts) {
      setOfferProductsData(dataOfferProducts.discount_products);
    }
  }, [dataOfferProducts, dispatch]);

  // Auto-scroll functionality
  useEffect(() => {
    if (!scrollContainerRef.current || !isPlaying || offerProductsData.length === 0) return;

    const scrollContainer = scrollContainerRef.current;
    const scrollWidth = scrollContainer.scrollWidth;
    const clientWidth = scrollContainer.clientWidth;
    const maxScroll = scrollWidth - clientWidth;

    if (maxScroll <= 0) return;

    autoScrollRef.current = setInterval(() => {
      const currentScroll = scrollContainer.scrollLeft;

      if (currentScroll >= maxScroll - 5) {
        scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scrollContainer.scrollBy({ left: 300, behavior: 'smooth' });
      }
    }, 3000);

    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
      }
    };
  }, [isPlaying, offerProductsData]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const toggleAutoScroll = () => {
    setIsPlaying(!isPlaying);
  };

  // Handle open product details dialog
  const handleProductClick = (product, e) => {
    e.stopPropagation();
    setSelectedProduct(product);
    setShowProductDialog(true);
  };

  // Handle close dialog
  const handleCloseDialog = () => {
    setShowProductDialog(false);
    setSelectedProduct(null);
  };

  // Show loading if data is not available yet
  if (loadingOfferProducts) {
    return (
      <div className="w-full py-16 text-center bg-gray-50">
        <StaticSpinner />
      </div>
    );
  }

  if (!offerProductsData || offerProductsData.length === 0) {
    return (
      <div className="w-full py-16 text-center bg-gray-50">
        <p className="text-gray-500 text-lg">No offers products available</p>
      </div>
    );
  }

  return (
    <section className="w-full py-4 px-4 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-mainColor">
              Offers Products
            </h2>
            <p className="text-gray-600 mt-1">Our specially selected items just for you</p>
          </div>

          {/* Navigation Controls - Only show if multiple products */}
          {offerProductsData.length > 1 && (
            <div className="flex items-center space-x-3">
              {/* <button 
                onClick={toggleAutoScroll}
                className="p-2 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center"
                aria-label={isPlaying ? 'Pause auto-scroll' : 'Play auto-scroll'}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4 text-gray-700" />
                ) : (
                  <Play className="h-4 w-4 text-gray-700" />
                )}
              </button> */}
              
              <div className="flex space-x-2">
                <button 
                  onClick={scrollLeft}
                  className="p-2 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-700" />
                </button>
                <button 
                  onClick={scrollRight}
                  className="p-2 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="h-5 w-5 text-gray-700" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Products Swiper */}
        <div className="relative group">
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto scrollbar-hide space-x-4 pb-6 -mx-4 px-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {offerProductsData.map((product) => (
              <div
                key={product.id}
                onClick={(e) => handleProductClick(product, e)}
                className="group flex-shrink-0 relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 w-56 flex flex-col border border-red-100"
              >
                <div className="relative w-full h-48 overflow-hidden">
                  <img
                    src={product.image_link}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5YzlkYWEiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjM1ZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                      e.target.style.objectFit = 'contain';
                    }}
                  />

                  {/* Discount badge */}
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    {product.discount}% OFF
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-3 flex-1 flex flex-col">
                  <h3 className="text-gray-900 font-semibold text-sm line-clamp-2 mb-1">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-xs line-clamp-2 mb-2">
                    {product.description && product.description !== "null"
                      ? product.description
                      : "Exclusive offer item"}
                  </p>
                  <div className="mt-auto flex justify-between items-center">
                    <div>
                      <span className="text-red-600 font-bold text-lg">
                        {product.price_after_discount} EGP
                      </span>
                      {product.price_after_discount < product.price && (
                        <span className="text-gray-500 text-sm line-through ml-2">
                          {product.price} EGP
                        </span>
                      )}
                    </div>
                  </div>
                  {product.price_after_discount < product.price && (
                    <p className="text-green-600 text-xs mt-1">
                      Save {(product.price - product.price_after_discount)} EGP!
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Details Dialog */}
      {showProductDialog && selectedProduct && (
        <ProductDetails
          product={selectedProduct}
          onClose={handleCloseDialog}
          language={selectedLanguage}
        />
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default OffersProducts;