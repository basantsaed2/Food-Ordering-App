import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCategories } from './../../../Store/Slices/CategoriesSlice';
import StaticSpinner from '../../../Components/Spinners/StaticSpinner';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGet } from '../../../Hooks/useGet';

const Categories = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const selectedLanguage = useSelector((state) => state.language?.selected ?? 'en');
  const [categoriesData, setCategoriesData] = useState(null);
  const dispatch = useDispatch();
  const scrollContainerRef = useRef(null);
  const autoScrollRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const {
    refetch: refetchCategories,
    loading: loadingCategories,
    data: dataCategories,
  } = useGet({
    url: `${apiUrl}/customer/home/categories?&locale=${selectedLanguage}`,
  });

  // Refetch products when language changes
  useEffect(() => {
    refetchCategories();
  }, [selectedLanguage, refetchCategories]);

  // Store the data in state
  useEffect(() => {
    if (dataCategories && !loadingCategories) {
      setCategoriesData(dataCategories.categories);
      dispatch(setCategories(dataCategories?.categories || []));
    }
  }, [dataCategories,dispatch]);

  // Auto-scroll functionality
  useEffect(() => {
    if (!scrollContainerRef.current || !isPlaying) return;

    const scrollContainer = scrollContainerRef.current;
    const scrollWidth = scrollContainer.scrollWidth;
    const clientWidth = scrollContainer.clientWidth;
    const maxScroll = scrollWidth - clientWidth;

    // Don't auto-scroll if all items are visible
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
  }, [isPlaying, categoriesData]);

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

  // Show loading if data is not available yet
  if (loadingCategories) {
    return (
      <div className="flex justify-center items-center py-12">
        <StaticSpinner />
      </div>
    );
  }

  if (!categoriesData || categoriesData.length === 0) {
    return (
      <div className="w-full py-16 text-center bg-gray-50">
        <p className="text-gray-500 text-lg">No categories available</p>
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
              Categories
            </h2>
          </div>

          {/* Navigation Controls - Only show if multiple categories */}
          {categoriesData.length > 1 && (
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleAutoScroll}
                className="p-2 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center"
                aria-label={isPlaying ? 'Pause auto-scroll' : 'Play auto-scroll'}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4 text-gray-700" />
                ) : (
                  <Play className="h-4 w-4 text-gray-700" />
                )}
              </button>

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

        {/* Categories Swiper */}
        <div className="relative group">
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto scrollbar-hide space-x-4 pb-6 -mx-4 px-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categoriesData.map((category) => (
              <Link
                key={category.id}
                to={`/products/${category.id}`}
                className="group flex-shrink-0 relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 w-40 h-48 flex flex-col"
              >
                <div className="relative w-full h-full overflow-hidden">
                  <img
                    src={category.image_link}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTQi IGZpbGw9IiM5YzlkYWEiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjM1ZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                      e.target.style.objectFit = 'contain';
                    }}
                  />

                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>

                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-white font-semibold text-sm text-center line-clamp-2">
                      {category.name}
                    </h3>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                      <ChevronRight className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Auto-scroll status indicator */}
          {categoriesData.length > 1 && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center space-x-1 bg-black/70 text-white px-2 py-1 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              <div className={`h-2 w-2 rounded-full ${isPlaying ? 'bg-green-400' : 'bg-gray-400'}`}></div>
              <span>Auto-scroll {isPlaying ? 'on' : 'paused'}</span>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default Categories;