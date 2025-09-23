import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Heart } from 'lucide-react';
import { useGet } from '../../Hooks/useGet';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../Store/Slices/cartSlice';
import { useChangeState } from '../../Hooks/useChangeState';
import StaticSpinner from '../../Components/Spinners/StaticSpinner';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../Context/Auth';

const ProductDetails = ({ product, onClose, language }) => {
  const { t } = useTranslation();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const dispatch = useDispatch();
  const { changeState, loadingChange } = useChangeState();
  const auth = useAuth();
  const token = useSelector((state) => state?.user?.data?.token || '');
  const [quantity, setQuantity] = useState(1);
  const [selectedVariations, setSelectedVariations] = useState({});
  const [selectedAddons, setSelectedAddons] = useState({});
  const [selectedExcludes, setSelectedExcludes] = useState([]);
  const [selectedExtras, setSelectedExtras] = useState({});
  const [note, setNote] = useState('');
  const [isFavorite, setIsFavorite] = useState(product.favourite || false);
  const [displayProduct, setDisplayProduct] = useState(product);
  const user = useSelector(state => state.user?.data?.user);

  // Fetch product details
  const {
    refetch: refetchProductDetails,
    loading: loadingProductDetails,
    data: productDetails,
  } = useGet({
    url: `${apiUrl}/customer/home/product_item/${product.id}?locale=${language}${user ? `&user_id=${user.id}` : ''}`,
  });

  // Refetch when language changes
  useEffect(() => {
    refetchProductDetails();
  }, [language, refetchProductDetails]);

  // Update product data
  useEffect(() => {
    if (productDetails && !loadingProductDetails) {
      setDisplayProduct(productDetails.product || product);
      setIsFavorite(productDetails.product?.favourite || false);
      const initialAddons = {};
      productDetails.addons?.forEach((addon) => {
        initialAddons[addon.id] = {
          checked: false,
          quantity: addon.quantity_add === 1 ? 1 : 1,
        };
      });
      setSelectedAddons(initialAddons);
      const initialExtras = {};
      productDetails.allExtras?.forEach((extra) => {
        initialExtras[extra.id] = 0;
      });
      setSelectedExtras(initialExtras);
    }
  }, [productDetails, product, loadingProductDetails]);

  const handleVariationChange = (variationId, optionId, type) => {
    if (type === 'single') {
      setSelectedVariations((prev) => ({
        ...prev,
        [variationId]: optionId,
      }));
    } else {
      setSelectedVariations((prev) => {
        const currentOptions = prev[variationId] || [];
        if (currentOptions.includes(optionId)) {
          return {
            ...prev,
            [variationId]: currentOptions.filter((id) => id !== optionId),
          };
        } else {
          return {
            ...prev,
            [variationId]: [...currentOptions, optionId],
          };
        }
      });
    }
  };

  const handleAddonChange = (addonId, checked) => {
    setSelectedAddons((prev) => ({
      ...prev,
      [addonId]: {
        ...prev[addonId],
        checked,
        quantity: checked && productDetails?.addons?.find((a) => a.id === addonId)?.quantity_add === 0 ? 1 : prev[addonId]?.quantity || 1,
      },
    }));
  };

  const handleAddonQuantityChange = (addonId, newQuantity) => {
    const addon = productDetails?.addons?.find((a) => a.id === addonId);
    if (addon?.quantity_add === 1) {
      setSelectedAddons((prev) => ({
        ...prev,
        [addonId]: { ...prev[addonId], quantity: Math.max(1, newQuantity) },
      }));
    }
  };

  const handleExcludeChange = (excludeId, checked) => {
    if (checked) {
      setSelectedExcludes((prev) => [...prev, excludeId]);
    } else {
      setSelectedExcludes((prev) => prev.filter((id) => id !== excludeId));
    }
  };

  const handleExtraQuantityChange = (extraId, newQuantity) => {
    const extra = productDetails?.allExtras?.find((e) => e.id === extraId);
    if (extra && isExtraAvailable(extra)) {
      const min = extra.min || 0;
      const max = extra.max || Infinity;
      const clampedQuantity = Math.max(min, Math.min(max, newQuantity));
      setSelectedExtras((prev) => ({
        ...prev,
        [extraId]: clampedQuantity,
      }));
    }
  };

  const handleFavoriteToggle = async () => {
    if (!token) {
      auth.toastError(t('pleaseLogin'));
      return;
    }
    const newFavoriteState = !isFavorite;
    const url = `${apiUrl}/customer/home/favourite/${product.id}`;
    const success = await changeState(
      url,
      newFavoriteState ? `${product.name} ${t('addedToFavorites')}` : `${product.name} ${t('removedFromFavorites')}`,
      { favourite: newFavoriteState ? 1 : 0 }
    );
    if (success) {
      setIsFavorite(newFavoriteState);
    }
  };

  const isExtraAvailable = (extra) => {
    if (!extra.variation_id && !extra.option_id) return true;
    if (extra.variation_id && extra.option_id) {
      const selectedOptions = selectedVariations[extra.variation_id];
      if (Array.isArray(selectedOptions)) {
        return selectedOptions.includes(extra.option_id);
      } else {
        return selectedOptions === extra.option_id;
      }
    }
    if (extra.variation_id && !extra.option_id) {
      const selectedOptions = selectedVariations[extra.variation_id];
      return selectedOptions && (Array.isArray(selectedOptions) ? selectedOptions.length > 0 : true);
    }
    return false;
  };

  const getAvailableExtras = () => {
    if (!productDetails?.allExtras) return [];
    return productDetails.allExtras.filter((extra) => isExtraAvailable(extra));
  };

  const calculateTotalPrice = () => {
  if (!productDetails) return (product.price_after_discount || product.price) * quantity;
  
  let total = parseFloat(productDetails.price_after_discount || productDetails.price);
  
  // Add variation prices
  Object.values(selectedVariations).forEach((optionIds) => {
    if (Array.isArray(optionIds)) {
      optionIds.forEach((optionId) => {
        const option = productDetails.variations
          .flatMap((v) => v.options)
          .find((o) => o.id === optionId);
        if (option) total += parseFloat(option.price);
      });
    } else {
      const option = productDetails.variations
        .flatMap((v) => v.options)
        .find((o) => o.id === optionIds);
      if (option) total += parseFloat(option.price);
    }
  });
  
  // Add addon prices
  Object.entries(selectedAddons).forEach(([addonId, addonData]) => {
    if (addonData.checked) {
      const addon = productDetails.addons?.find((a) => a.id === parseInt(addonId));
      if (addon) {
        const addonQty = addonData.quantity || 1;
        total += parseFloat(addon.price) * addonQty;
      }
    }
  });
  
  // Add extra prices (use price_after_discount for extras)
  Object.entries(selectedExtras).forEach(([extraId, extraQty]) => {
    const extra = productDetails.allExtras?.find((e) => e.id === parseInt(extraId));
    if (extra && extraQty > 0 && isExtraAvailable(extra)) {
      total += parseFloat(extra.price_after_discount || extra.price) * extraQty;
    }
  });
  
  return total * quantity;
};

//   const calculateTotalPrice = () => {
//     if (!productDetails) return (product.price_after_discount || product.price) * quantity;
//     let total = parseFloat(productDetails.price_after_discount || productDetails.price);
//     Object.values(selectedVariations).forEach((optionIds) => {
//       if (Array.isArray(optionIds)) {
//         optionIds.forEach((optionId) => {
//           const option = productDetails.variations
//             .flatMap((v) => v.options)
//             .find((o) => o.id === optionId);
//           if (option) total += parseFloat(option.price);
//         });
//       } else {
//         const option = productDetails.variations
//           .flatMap((v) => v.options)
//           .find((o) => o.id === optionIds);
//         if (option) total += parseFloat(option.price);
//       }
//     });
//     Object.entries(selectedAddons).forEach(([addonId, addonData]) => {
//       if (addonData.checked) {
//         const addon = productDetails.addons?.find((a) => a.id === parseInt(addonId));
//         if (addon) {
//           const addonQty = addonData.quantity || 1;
//           total += parseFloat(addon.price) * addonQty;
//         }
//       }
//     });
//     Object.entries(selectedExtras).forEach(([extraId, extraQty]) => {
//       const extra = productDetails.allExtras?.find((e) => e.id === parseInt(extraId));
//       if (extra && extraQty > 0 && isExtraAvailable(extra)) {
//         total += parseFloat(extra.price_after_discount || extra.price) * extraQty;
//       }
//     });
//     return total * quantity;
//   };

  const validateVariationSelection = (variation) => {
    if (!variation.required) return true;
    const selectedOptions = selectedVariations[variation.id];
    if (variation.type === 'single') {
      return !!selectedOptions;
    } else {
      const selectedCount = Array.isArray(selectedOptions) ? selectedOptions.length : 0;
      if (variation.min !== null && selectedCount < variation.min) return false;
      if (variation.max !== null && selectedCount > variation.max) return false;
      return selectedCount > 0;
    }
  };

  const validateExtrasSelection = () => {
    const availableExtras = getAvailableExtras();
    if (!availableExtras.length) return true;
    return availableExtras.every((extra) => {
      const quantity = selectedExtras[extra.id] || 0;
      if (extra.min !== null && quantity < extra.min) return false;
      if (extra.max !== null && quantity > extra.max) return false;
      return true;
    });
  };

  const canAddToCart = () => {
    if (!productDetails) return true;
    const variationsValid = productDetails.variations?.every(validateVariationSelection) ?? true;
    const extrasValid = validateExtrasSelection();
    return variationsValid && extrasValid;
  };

  const handleAddToCart = () => {
    if (!canAddToCart()) return;
    const cartItem = {
      product: productDetails || product,
      quantity,
      variations: selectedVariations,
      addons: selectedAddons,
      excludes: selectedExcludes,
      extras: selectedExtras,
      note: note.trim(),
      totalPrice: calculateTotalPrice(),
    };
    dispatch(addToCart(cartItem));
    auth.toastSuccess(`${product.name} ${t('addedToCart')}`);
    onClose();
  };

  if (loadingProductDetails) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <StaticSpinner />
        </div>
      </div>
    );
  }

  const displayData = productDetails || product;
  const availableExtras = getAvailableExtras();
  const taxSetting = displayData.taxes?.setting || 'excluded';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-mainColor">{displayData.name}</h2>
          <div className="flex items-center gap-2">
            {/* Favorite Button */}
            {user && (
              <button
                onClick={handleFavoriteToggle}
                disabled={loadingChange}
                className={`p-2 rounded-full transition-colors ${
                  isFavorite ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                }`}
                title={isFavorite ? t('removeFromFavorites') : t('addToFavorites')}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        {/* Content */}
        <div className="p-6">
          {/* Image */}
          <div className="mb-6">
            <img
              src={displayData.image_link}
              alt={displayData.name}
              className="w-full h-48 object-cover rounded-lg"
              onError={(e) => {
                e.target.src =
                  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5YzlkYWEiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjM1ZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
              }}
            />
          </div>
          {/* Description */}
          <p className="text-gray-600 mb-6">{displayData.description}</p>
          {/* Price Display */}
          <div className="mb-6 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{t('price')}</span>
              <div className="flex items-center gap-2">
                {displayData.discount_val > 0 && (
                  <span className="text-red-500 line-through">
                    {displayData.price} EGP
                  </span>
                )}
                <span className="text-mainColor font-bold text-lg">
                  {displayData.price_after_discount || displayData.price} EGP
                </span>
              </div>
            </div>
            {taxSetting === 'included' && displayData.tax_val > 0 && (
              <div className="text-sm text-gray-600 mt-1">
                {t('taxIncluded')}: {displayData.tax_val} EGP
              </div>
            )}
          </div>
          {/* Variations */}
          {displayData.variations?.map((variation) => (
            <div key={variation.id} className="mb-6">
              <h3 className="font-semibold mb-3">
                {variation.name} {variation.required && <span className="text-red-500">*</span>}
                {variation.type === 'multiple' && (
                  <span className="text-sm text-gray-500 ml-2">
                    ({t('select')} {variation.min}-{variation.max})
                  </span>
                )}
              </h3>
              <div className="space-y-2">
                {variation.options.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex items-center">
                      <input
                        type={variation.type === 'single' ? 'radio' : 'checkbox'}
                        name={`variation-${variation.id}`}
                        checked={
                          variation.type === 'single'
                            ? selectedVariations[variation.id] === option.id
                            : (selectedVariations[variation.id] || []).includes(option.id)
                        }
                        onChange={() => handleVariationChange(variation.id, option.id, variation.type)}
                        className="mr-3"
                      />
                      <span>{option.name}</span>
                    </div>
                    {option.price > 0 && (
                      <span className="text-mainColor font-semibold">
                        +{option.price} EGP
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          ))}
          {/* Addons */}
          {displayData.addons?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">{t('addons')}</h3>
              <div className="space-y-2">
                {displayData.addons.map((addon) => {
                  const canChangeQuantity = addon.quantity_add === 1;
                  const currentAddon = selectedAddons[addon.id];
                  return (
                    <div key={addon.id} className="p-3 border rounded-lg hover:bg-gray-50">
                      <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={!!currentAddon?.checked}
                            onChange={(e) => handleAddonChange(addon.id, e.target.checked)}
                            className="mr-3"
                          />
                          <span>{addon.name}</span>
                        </div>
                        <span className="text-mainColor font-semibold">
                          +{addon.price} EGP
                        </span>
                      </label>
                      {currentAddon?.checked && (
                        <div className="mt-2 flex items-center justify-end gap-2 pl-6">
                          {canChangeQuantity ? (
                            <>
                              <span className="text-sm text-gray-600">{t('quantity')}:</span>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleAddonQuantityChange(addon.id, currentAddon.quantity - 1)}
                                  className="p-1 rounded-full border border-gray-300 hover:bg-gray-100"
                                  disabled={currentAddon.quantity <= 1}
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-6 text-center font-semibold text-sm">
                                  {currentAddon.quantity}
                                </span>
                                <button
                                  onClick={() => handleAddonQuantityChange(addon.id, currentAddon.quantity + 1)}
                                  className="p-1 rounded-full border border-gray-300 hover:bg-gray-100"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                            </>
                          ) : (
                            <span className="text-sm text-gray-600">{t('quantity')}: 1 (fixed)</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {/* Extras */}
          {availableExtras.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">{t('availableExtras')}</h3>
              <div className="space-y-3">
                {availableExtras.map((extra) => {
                  const currentQty = selectedExtras[extra.id] || 0;
                  const min = extra.min || 0;
                  const max = extra.max || Infinity;
                  const hasDiscount = extra.price_after_discount && extra.price_after_discount < extra.price;

                  return (
                    <div key={extra.id} className="p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{extra.name}</span>
                        <div className="flex items-center gap-2">
                          {hasDiscount && (
                            <span className="text-red-500 text-sm line-through">
                              {extra.price} EGP
                            </span>
                          )}
                          <span className="text-mainColor font-semibold">
                            +{extra.price_after_discount || extra.price} EGP
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {min > 0 && `${t('min')}: ${min}, `}
                          {t('max')}: {max === Infinity ? t('noLimit') : max}
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleExtraQuantityChange(extra.id, currentQty - 1)}
                            className="p-1 rounded-full border border-gray-300 hover:bg-gray-100"
                            disabled={currentQty <= min}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center font-semibold text-sm">
                            {currentQty}
                          </span>
                          <button
                            onClick={() => handleExtraQuantityChange(extra.id, currentQty + 1)}
                            className="p-1 rounded-full border border-gray-300 hover:bg-gray-100"
                            disabled={currentQty >= max}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {/* Excludes */}
          {displayData.excludes?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">{t('excludeItems')}</h3>
              <div className="space-y-2">
                {displayData.excludes.map((exclude) => (
                  <label
                    key={exclude.id}
                    className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedExcludes.includes(exclude.id)}
                      onChange={(e) => handleExcludeChange(exclude.id, e.target.checked)}
                      className="mr-3"
                    />
                    <span>{exclude.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          {/* Note Input */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">{t('specialInstructions')}</h3>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('addSpecialInstructions')}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-mainColor"
              rows={3}
              maxLength={500}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {note.length}/500 {t('characters')}
            </div>
          </div>
          {/* Quantity */}
          <div className="flex items-center justify-between mb-6">
            <span className="font-semibold">{t('quantity')}</span>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-1 rounded-full border border-gray-300 hover:bg-gray-100"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="p-1 rounded-full border border-gray-300 hover:bg-gray-100"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
          {/* Total Price */}
          <div className="flex justify-between items-center mb-6 p-4 bg-mainColor/10 rounded-lg">
            <span className="text-lg font-semibold">{t('totalPrice')}</span>
            <span className="text-2xl font-bold text-mainColor">
              {calculateTotalPrice().toFixed(2)} EGP
            </span>
          </div>
          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!canAddToCart()}
            className={`w-full py-3 rounded-lg font-semibold transition-colors ${
              canAddToCart()
                ? 'bg-mainColor text-white hover:bg-mainColor/90'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {canAddToCart() ? t('addToCart') : t('completeSelection')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
