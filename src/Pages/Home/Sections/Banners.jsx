import { Splide, SplideSlide } from '@splidejs/react-splide';
import React, { useEffect, useState } from 'react';
import '@splidejs/react-splide/css';
import StaticSpinner from '../../../Components/Spinners/StaticSpinner';
import { useGet } from '../../../Hooks/useGet';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

const Banners = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { refetch: refetchBannerData, loading: loadingBannerData, data: dataBanner } = useGet({
    url: `${apiUrl}/customer/home/slider`,
  });
  const [bannerData, setBannerData] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [splideRef, setSplideRef] = useState(null);

  useEffect(() => {
    refetchBannerData();
  }, [refetchBannerData]);

  useEffect(() => {
    if (dataBanner && dataBanner.banners) {
      setBannerData(dataBanner?.banners);
    }
  }, [dataBanner]);

  const handleSlideChange = (splide) => {
    setCurrentSlide(splide.index);
  };

  const togglePlayPause = () => {
    if (splideRef) {
      if (isPlaying) {
        splideRef.Components.Autoplay.pause();
      } else {
        splideRef.Components.Autoplay.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const goToSlide = (index) => {
    if (splideRef) {
      splideRef.go(index);
    }
  };

  if (loadingBannerData) {
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-full py-16">
        <StaticSpinner />
      </div>
    );
  }

  if (!bannerData || bannerData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-full py-16">
        <div className="w-full max-w-6xl mx-auto px-4 h-64 md:h-80 bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center">
          <p className="text-gray-500 font-medium">No banners available</p>
        </div>
      </div>
    );
  }

  return (
    <section className="relative w-full md:p-6 overflow-hidden">
      {/* Main Container */}
      <div className="relative w-full">
        
        {/* Banner Carousel */}
        <div className="relative group">
          <Splide
            key={bannerData.length}
            className="banner-carousel"
            options={{
              type: bannerData.length > 1 ? 'loop' : 'slide',
              rewind: true,
              autoplay: bannerData.length > 1,
              interval: 4000,
              speed: 800,
              perPage: 1,
              pauseOnHover: true,
              arrows: false,
              pagination: false,
              gap: '1rem',
              padding: '0',
              focus: 'center',
              trimSpace: false,
              breakpoints: {
                1024: { 
                  gap: '0.5rem',
                },
                768: { 
                  gap: '0.25rem',
                },
              },
            }}
            onMounted={(splide) => {
              setSplideRef(splide);
              splide.on('moved', () => handleSlideChange(splide));
            }}
          >
            {bannerData.map((banner, index) => (
              <SplideSlide key={index} className="relative">
                <div className="relative overflow-hidden md:rounded-xl shadow-2xl bg-gradient-to-br from-gray-900 to-gray-800">
                  {/* Image Container */}
                  <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
                    <img
                      src={banner.image_link}
                      className="w-full h-full object-fit object-center transition-transform duration-700 group-hover:scale-105"
                      alt={banner.title || `Banner ${index + 1}`}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      onError={(e) => {
                        e.target.style.objectFit = 'contain';
                        e.target.style.backgroundColor = '#f3f4f6';
                      }}
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />
                  </div>

                  {/* Content Overlay (if banner has title/description) */}
                  {(banner.title || banner.description) && (
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 lg:p-12">
                      <div className="max-w-2xl">
                        {banner.title && (
                          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 md:mb-4 leading-tight">
                            {banner.title}
                          </h2>
                        )}
                        {banner.description && (
                          <p className="text-gray-200 text-sm md:text-lg lg:text-xl leading-relaxed mb-4 md:mb-6">
                            {banner.description}
                          </p>
                        )}
                        {banner.cta_text && (
                          <button 
                            className="inline-flex items-center px-6 py-3 text-white font-semibold rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
                            style={{ backgroundColor: 'var(--color-main, #d7030b)' }}
                          >
                            {banner.cta_text}
                            <ChevronRight className="ml-2 h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Slide Number Badge */}
                  {/* <div className="absolute top-4 right-4 md:top-6 md:right-6">
                    <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                      {index + 1} / {bannerData.length}
                    </div>
                  </div> */}
                </div>
              </SplideSlide>
            ))}
          </Splide>

          {/* Custom Navigation Arrows */}
          {bannerData.length > 1 && (
            <>
              <button
                onClick={() => splideRef?.go('<')}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              
              <button
                onClick={() => splideRef?.go('>')}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
                aria-label="Next slide"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Play/Pause Button */}
          {bannerData.length > 1 && (
            <button
              onClick={togglePlayPause}
              className="absolute bottom-4 right-4 z-10 bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
              aria-label={isPlaying ? 'Pause autoplay' : 'Start autoplay'}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {/* Custom Pagination Dots */}
        {bannerData.length > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-6 md:mt-8">
            {bannerData.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentSlide
                    ? 'w-8 h-3 opacity-100'
                    : 'w-3 h-3 opacity-60 hover:opacity-80'
                }`}
                style={{ 
                  backgroundColor: index === currentSlide ? 'var(--color-main, #d7030b)' : '#d1d5db'
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Banners;