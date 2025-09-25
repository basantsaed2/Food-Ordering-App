// // Components/ProductCard.jsx
// import React, { useState } from 'react';
// import { Heart, Plus } from 'lucide-react';
// import ProductDetails from '../Pages/Products/ProductDetails'; // Import your existing ProductDetails component
// import { useDispatch, useSelector } from 'react-redux';
// import { addToCart } from '../Store/Slices/cartSlice';
// import { useChangeState } from '../Hooks/useChangeState';
// import { useAuth } from '../Context/Auth';

// const ProductCard = ({ 
//   product, 
//   isFavorite: initialIsFavorite = false,
//   onFavoriteToggle: externalOnFavoriteToggle,
//   onAddToCart: externalOnAddToCart,
//   language = 'en'
// }) => {
//   const apiUrl = import.meta.env.VITE_API_BASE_URL;
//   const dispatch = useDispatch();
//   const { changeState } = useChangeState();
//   const token = useSelector(state => state?.user?.data?.token || '');
//   const auth = useAuth();

//   // Card state
//   const [isCardFavorite, setIsCardFavorite] = useState(initialIsFavorite);

//   // Internal Product Details Dialog state - exactly like your original pattern
//   const [showProductDialog, setShowProductDialog] = useState(false);
//   const [selectedProduct, setSelectedProduct] = useState(null);

//   // Handle card favorite toggle
//   const handleCardFavoriteToggle = async (e) => {
//     e.stopPropagation();

//     if (!token) {
//       auth.toastError('Please login to add favorites');
//       return;
//     }

//     const newFavoriteState = !isCardFavorite;
//     const url = `${apiUrl}/customer/home/favourite/${product.id}`;
//     const success = await changeState(url, `${product.name} ${newFavoriteState ? 'added to' : 'removed from'} favorites!`, {
//       favourite: newFavoriteState ? 1 : 0,
//     });

//     if (success) {
//       setIsCardFavorite(newFavoriteState);
//       // Call external callback if provided
//       if (externalOnFavoriteToggle) {
//         externalOnFavoriteToggle(product, newFavoriteState);
//       }
//     }
//   };

//   // Handle quick add to cart (plus button on card)
//   const handleQuickAddToCart = (e) => {
//     e.stopPropagation();
//     const cartItem = {
//       product,
//       quantity: 1,
//       variations: {},
//       addons: {},
//       excludes: [],
//       extras: {},
//       note: ''
//     };

//     dispatch(addToCart(cartItem));
//     auth.toastSuccess(`${product.name} added to cart!`);

//     // Call external callback if provided
//     if (externalOnAddToCart) {
//       externalOnAddToCart(product);
//     }
//   };

//   // Handle open product details dialog - exactly like your original pattern
//   const handleProductClick = (e) => {
//     e.stopPropagation();
//     setSelectedProduct(product);
//     setShowProductDialog(true);
//   };

//   // Handle close dialog - exactly like your original pattern
//   const handleCloseDialog = () => {
//     setShowProductDialog(false);
//     setSelectedProduct(null);
//   };

//   return (
//     <>
//       {/* Product Card */}
//       <div
//         onClick={handleProductClick}
//         className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-row h-32 cursor-pointer relative group"
//       >
//         {/* Favorite Heart */}
//         <button
//           onClick={handleCardFavoriteToggle}
//           className={`absolute top-2 right-2 z-10 p-1 rounded-full transition-all duration-200 ${
//             isCardFavorite
//               ? 'text-red-500 bg-white shadow-sm'
//               : 'text-gray-400 bg-white/80 hover:text-red-500 hover:bg-white'
//           }`}
//           title={isCardFavorite ? 'Remove from favorites' : 'Add to favorites'}
//         >
//           <Heart className={`h-4 w-4 ${isCardFavorite ? 'fill-current' : ''}`} />
//         </button>

//         {/* Product Image */}
//         <div className="w-32 flex-shrink-0 relative overflow-hidden">
//           <img
//             src={product.image_link}
//             alt={product.name}
//             className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
//             onError={(e) => {
//               e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5YzlkYWEiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjM1ZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
//               e.target.style.objectFit = 'contain';
//             }}
//           />
//         </div>

//         {/* Product Content */}
//         <div className="flex-1 p-3 flex flex-col justify-between overflow-hidden">
//           <div className="overflow-hidden">
//             <h3 className="font-semibold text-base mb-1 line-clamp-1 leading-tight">
//               {product.name}
//             </h3>
//             <p className="text-gray-600 text-xs mb-2 line-clamp-2 leading-relaxed">
//               {product.description}
//             </p>
//           </div>

//           <div className="flex justify-between items-center">
//             <div className="flex items-center gap-2">
//               <span className="text-mainColor font-bold text-sm">
//                 {product.price_after_discount || product.price} EGP
//               </span>
//               {product.discount > 0 && (
//                 <span className="text-red-500 text-xs line-through">
//                   {product.price} EGP
//                 </span>
//               )}
//             </div>
//             <button
//               onClick={handleQuickAddToCart}
//               className="p-1.5 bg-mainColor text-white rounded-full hover:bg-mainColor/90 transition-all duration-200 flex-shrink-0 shadow-sm hover:shadow-md transform hover:scale-105"
//               title="Quick add to cart"
//             >
//               <Plus className="h-3.5 w-3.5" />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Product Details Dialog - EXACTLY like your original pattern */}
//       {showProductDialog && selectedProduct && (
//         <ProductDetails
//           product={selectedProduct}
//           onClose={handleCloseDialog}
//           language={language}
//         />
//       )}
//     </>
//   );
// };

// export default ProductCard;

import React, { useState } from 'react';
import { Heart, Plus } from 'lucide-react';
import ProductDetails from '../Pages/Products/ProductDetails';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../Store/Slices/cartSlice';
import { useChangeState } from '../Hooks/useChangeState';
import { useAuth } from '../Context/Auth';
import { useTranslation } from 'react-i18next';

const ProductCard = ({
  product,
  isFavorite: initialIsFavorite = false,
  language = 'en',
}) => {
  const { t } = useTranslation();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const dispatch = useDispatch();
  const { changeState } = useChangeState();
  const token = useSelector((state) => state?.user?.data?.token || '');
  const auth = useAuth();
  const user = useSelector(state => state.user?.data?.user);

  // Card state
  const [isCardFavorite, setIsCardFavorite] = useState(initialIsFavorite);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Handle card favorite toggle
  const handleCardFavoriteToggle = async (e) => {
    e.stopPropagation();
    if (!token) {
      auth.toastError(t('pleaseLogin'));
      return;
    }
    const newFavoriteState = !isCardFavorite;
    const url = `${apiUrl}/customer/home/favourite/${product.id}`;
    const success = await changeState(
      url,
      `${product.name} ${newFavoriteState ? t('addedToFavorites') : t('removedFromFavorites')}`,
      { favourite: newFavoriteState ? 1 : 0 }
    );
    if (success) {
      setIsCardFavorite(newFavoriteState);
    }
  };

  // Handle quick add to cart
  const handleQuickAddToCart = (e) => {
    e.stopPropagation();
    const cartItem = {
      product,
      quantity: 1,
      variations: {},
      addons: {},
      excludes: [],
      extras: {},
      note: '',
    };
    dispatch(addToCart(cartItem));
    auth.toastSuccess(`${product.name} ${t('addedToCart')}`);
  };

  // Handle open product details dialog
  const handleProductClick = (e) => {
    e.stopPropagation();
    setSelectedProduct(product);
    setShowProductDialog(true);
  };

  // Handle close dialog
  const handleCloseDialog = () => {
    setShowProductDialog(false);
    setSelectedProduct(null);
  };

  return (
    <>
      {/* Product Card */}
      <div
        onClick={handleProductClick}
        className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-row h-32 cursor-pointer relative group"
      >
        {/* Favorite Heart */}
        {user && (
          <button
            onClick={handleCardFavoriteToggle}
            className={`absolute top-2 right-2 z-10 p-1 rounded-full transition-all duration-200 ${isCardFavorite
                ? 'text-red-500 bg-white shadow-sm'
                : 'text-gray-400 bg-white/80 hover:text-red-500 hover:bg-white'
              }`}
            title={isCardFavorite ? t('removeFromFavorites') : t('addToFavorites')}
          >
            <Heart className={`h-4 w-4 ${isCardFavorite ? 'fill-current' : ''}`} />
          </button>
        )}
        {/* Product Image */}
        <div className="w-32 flex-shrink-0 relative overflow-hidden">
          <img
            src={product.image_link}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.target.src =
                'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5YzlkYWEiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjM1ZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
              e.target.style.objectFit = 'contain';
            }}
          />
        </div>
        {/* Product Content */}
        <div className="flex-1 p-3 flex flex-col justify-between overflow-hidden">
          <div className="overflow-hidden">
            <h3 className="font-semibold text-base mb-1 line-clamp-1 leading-tight">
              {product.name}
            </h3>
            <p className="text-gray-600 text-xs mb-2 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-mainColor font-bold text-sm">
                {product.price_after_discount || product.price} EGP
              </span>
              {product.discount > 0 && (
                <span className="text-red-500 text-xs line-through">
                  {product.price} EGP
                </span>
              )}
            </div>
            <button
              onClick={handleProductClick}
              className="p-1.5 bg-mainColor text-white rounded-full hover:bg-mainColor/90 transition-all duration-200 flex-shrink-0 shadow-sm hover:shadow-md transform hover:scale-105"
              title={t('quickAddToCart')}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
      {/* Product Details Dialog */}
      {showProductDialog && selectedProduct && (
        <ProductDetails
          product={selectedProduct}
          onClose={handleCloseDialog}
          language={language}
        />
      )}
    </>
  );
};

export default ProductCard;