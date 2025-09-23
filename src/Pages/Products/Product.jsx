import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import StaticSpinner from '../../Components/Spinners/StaticSpinner';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useGet } from '../../Hooks/useGet';
import ProductCard from '../../Components/ProductCard';
import { setTaxType } from '../../Store/Slices/taxTypeSlice';
import { useAuth } from '../../Context/Auth';
import { setSelectedBranch, setSelectedAddress, setOrderType } from '../../Store/Slices/orderTypeSlice'; // Add this import

const Products = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const auth = useAuth();
  const selectedLanguage = useSelector((state) => state.language?.selected ?? 'en');
  const user = useSelector(state => state.user?.data?.user);

  // Read from Redux state
  const orderType = useSelector((state) => state.orderType?.orderType);
  const selectedAddressId = useSelector((state) => state.orderType?.selectedAddressId);
  const selectedBranchId = useSelector((state) => state.orderType?.selectedBranchId);

  const [categoriesData, setCategoriesData] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(categoryId ? parseInt(categoryId) : null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const scrollContainerRef = useRef(null);

  // Extract query parameters DIRECTLY from URL
  const queryParams = new URLSearchParams(location.search);
  const urlAddressId = queryParams.get('address_id');
  const urlBranchId = queryParams.get('branch_id');
  const urlOrderType = queryParams.get('order_type');

  // Use URL parameters first, fallback to Redux state
  const effectiveAddressId = urlAddressId ? parseInt(urlAddressId) : selectedAddressId;
  const effectiveBranchId = urlBranchId ? parseInt(urlBranchId) : selectedBranchId;
  const effectiveOrderType = urlOrderType || orderType;

  // Sync URL parameters with Redux state on component mount
  useEffect(() => {
    // Restore from localStorage on mount (this should be in your orderTypeSlice)
    const savedOrderType = localStorage.getItem('orderType');
    const savedAddressId = localStorage.getItem('selectedAddressId');
    const savedBranchId = localStorage.getItem('selectedBranchId');

    // Priority: URL params > localStorage > existing Redux state
    if (urlOrderType && urlOrderType !== orderType) {
      dispatch(setOrderType(urlOrderType));
    } else if (savedOrderType && savedOrderType !== orderType) {
      dispatch(setOrderType(savedOrderType));
    }

    if (urlAddressId && parseInt(urlAddressId) !== selectedAddressId) {
      dispatch(setSelectedAddress(parseInt(urlAddressId)));
    } else if (savedAddressId && parseInt(savedAddressId) !== selectedAddressId) {
      dispatch(setSelectedAddress(parseInt(savedAddressId)));
    }

    if (urlBranchId && parseInt(urlBranchId) !== selectedBranchId) {
      dispatch(setSelectedBranch(parseInt(urlBranchId)));
    } else if (savedBranchId && parseInt(savedBranchId) !== selectedBranchId) {
      dispatch(setSelectedBranch(parseInt(savedBranchId)));
    }
  }, [dispatch, urlOrderType, urlAddressId, urlBranchId, orderType, selectedAddressId, selectedBranchId]);

  // Build API URL for categories
  const buildCategoriesUrl = useCallback(() => {
    let url = `${apiUrl}/customer/home/categories?locale=${selectedLanguage}`;

    if (effectiveAddressId && effectiveOrderType === 'delivery') {
      url += `&address_id=${effectiveAddressId}`;
    } else if (effectiveBranchId && effectiveOrderType === 'take_away') {
      url += `&branch_id=${effectiveBranchId}`;
    }

    return url;
  }, [apiUrl, selectedLanguage, effectiveAddressId, effectiveBranchId, effectiveOrderType]);

  // Build API URL for products
  const buildProductsUrl = useCallback(() => {
    if (!selectedCategory) return null;

    let url = `${apiUrl}/customer/home/products_in_category/${selectedCategory}?locale=${selectedLanguage}${user ? `&user_id=${user.id}` : ""
            }`;

    if (effectiveAddressId && effectiveOrderType === 'delivery') {
      url += `&address_id=${effectiveAddressId}`;
    } else if (effectiveBranchId && effectiveOrderType === 'take_away') {
      url += `&branch_id=${effectiveBranchId}`;
    }

    return url;
  }, [apiUrl, selectedCategory, selectedLanguage, effectiveAddressId, effectiveBranchId, effectiveOrderType]);

  // Fetch categories
  const {
    refetch: refetchCategories,
    loading: loadingCategories,
    data: dataCategories,
  } = useGet({
    url: buildCategoriesUrl(),
    required: !!effectiveAddressId || !!effectiveBranchId,
  });

  // Fetch products
  const {
    refetch: refetchProducts,
    loading: loadingProducts,
    data: dataProducts,
  } = useGet({
    url: buildProductsUrl(),
  });

  // Refetch when language changes or URL parameters change
  useEffect(() => {
    refetchCategories();
  }, [selectedLanguage, effectiveAddressId, effectiveBranchId, effectiveOrderType, refetchCategories]);

  // Update categories data
  useEffect(() => {
    if (dataCategories && !loadingCategories) {
      setCategoriesData(dataCategories.categories || []);

      // Set selected category if not set
      if (categoryId && !selectedCategory) {
        setSelectedCategory(parseInt(categoryId));
      }
    }
  }, [dataCategories, loadingCategories, categoryId, selectedCategory]);

  // Auto-select first category if none selected
  useEffect(() => {
    if (!selectedCategory && categoriesData.length > 0 && effectiveOrderType &&
      (effectiveAddressId || effectiveBranchId)) {

      const firstCategory = categoriesData[0].id;
      setSelectedCategory(firstCategory);

      // Update URL to reflect the selected category
      const query = new URLSearchParams();
      if (effectiveOrderType === 'delivery' && effectiveAddressId) {
        query.set('address_id', effectiveAddressId);
        query.set('order_type', 'delivery');
      } else if (effectiveOrderType === 'take_away' && effectiveBranchId) {
        query.set('branch_id', effectiveBranchId);
        query.set('order_type', 'take_away');
      }

      navigate(`/products/${firstCategory}?${query.toString()}`, { replace: true });
    }
  }, [selectedCategory, categoriesData, effectiveOrderType, effectiveAddressId, effectiveBranchId, navigate]);

  // Update products data
  useEffect(() => {
    if (dataProducts && !loadingProducts) {
      const prods = dataProducts.products || [];
      setProductsData(prods);
      dispatch(setTaxType(dataProducts.tax));
    }
  }, [dataProducts, loadingProducts, dispatch]);

  // Refetch products when selected category or query params change
  useEffect(() => {
    if (selectedCategory && effectiveOrderType && (effectiveAddressId || effectiveBranchId)) {
      refetchProducts();
      setSelectedSubCategory(null);
    }
  }, [selectedCategory, refetchProducts, effectiveAddressId, effectiveBranchId, effectiveOrderType]);


  // Scroll functions for categories
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

  // Handle category click
  const handleCategoryClick = useCallback(
    (categoryId) => {
      setSelectedCategory(categoryId);
      const query = new URLSearchParams();

      if (effectiveOrderType === 'delivery' && effectiveAddressId) {
        query.set('address_id', effectiveAddressId);
        query.set('order_type', 'delivery');
      } else if (effectiveOrderType === 'take_away' && effectiveBranchId) {
        query.set('branch_id', effectiveBranchId);
        query.set('order_type', 'take_away');
      }

      navigate(`/products/${categoryId}?${query.toString()}`);
      window.scrollTo(0, 0);
    },
    [navigate, effectiveAddressId, effectiveBranchId, effectiveOrderType]
  );

  // Handle subcategory click
  const handleSubCategoryClick = useCallback((subCategoryId) => {
    setSelectedSubCategory(subCategoryId);
  }, []);

  const currentCategory = categoriesData.find((cat) => cat.id === selectedCategory);
  const subCategories = currentCategory?.sub_categories || [];
  const filteredProducts = selectedSubCategory
    ? productsData.filter((product) => product.sub_category_id === selectedSubCategory)
    : productsData;

  if (loadingCategories) {
    return (
      <div className="flex justify-center items-center py-12">
        <StaticSpinner />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Categories Navigation */}
      <div className="sticky top-0 z-10 bg-white shadow-md py-4 px-4">
        <div className="max-w-7xl mx-auto relative">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-mainColor">Categories</h2>
            {categoriesData.length > 1 && (
              <div className="flex space-x-2">
                <button
                  onClick={scrollLeft}
                  className="p-2 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-700" />
                </button>
                <button
                  onClick={scrollRight}
                  className="p-2 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className="h-5 w-5 text-gray-700" />
                </button>
              </div>
            )}
          </div>
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto scrollbar-hide space-x-3 pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categoriesData.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category.id
                    ? 'bg-mainColor text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Subcategories */}
      {subCategories.length > 0 && (
        <div className="bg-white py-3 px-4 border-b">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-md font-semibold text-gray-700 mb-2">Subcategories</h3>
            <div className="flex overflow-x-auto scrollbar-hide space-x-2">
              <button
                onClick={() => setSelectedSubCategory(null)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs transition-colors ${selectedSubCategory === null
                    ? 'bg-mainColor text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
              >
                All
              </button>
              {subCategories.map((subCategory) => (
                <button
                  key={subCategory.id}
                  onClick={() => handleSubCategoryClick(subCategory.id)}
                  className={`flex-shrink-0 px-3 py-1 rounded-full text-xs transition-colors ${selectedSubCategory === subCategory.id
                      ? 'bg-mainColor text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                >
                  {subCategory.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto p-4">
        {loadingProducts ? (
          <div className="flex justify-center items-center py-12">
            <StaticSpinner />
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorite={product.favourite}
                language={selectedLanguage}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found in this category.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default Products;