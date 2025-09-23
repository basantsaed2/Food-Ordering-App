import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Minus, Plus, X, ShoppingCart, Trash2 } from 'lucide-react';
import { 
  incrementQuantity, 
  decrementQuantity, 
  removeFromCart, 
  clearCart 
} from '../../Store/Slices/cartSlice';

const Cart = () => {
  const dispatch = useDispatch();
  const { items, total, itemCount, subtotal, totalDiscount, totalTax } = useSelector(state => state.cart);

  // Calculate detailed price breakdown
  const calculatePriceBreakdown = () => {
    let calculatedSubtotal = 0;
    let calculatedDiscount = 0;
    let calculatedTax = 0;

    items.forEach(item => {
      // Base product price
      const basePrice = parseFloat(item.product.price) * item.quantity;
      calculatedSubtotal += basePrice;

      // Discount calculation
      const discountPrice = parseFloat(item.product.price_after_discount || item.product.price) * item.quantity;
      const itemDiscount = basePrice - discountPrice;
      calculatedDiscount += Math.max(0, itemDiscount);

      // Variation prices
      if (item.variations) {
        Object.values(item.variations).forEach(optionIds => {
          if (Array.isArray(optionIds)) {
            optionIds.forEach(optionId => {
              const option = findOptionInProduct(item.product, optionId);
              if (option) {
                calculatedSubtotal += parseFloat(option.price) * item.quantity;
              }
            });
          } else {
            const option = findOptionInProduct(item.product, optionIds);
            if (option) {
              calculatedSubtotal += parseFloat(option.price) * item.quantity;
            }
          }
        });
      }

      // Addon prices
      if (item.addons) {
        Object.entries(item.addons).forEach(([addonId, addonData]) => {
          if (addonData.checked) {
            const addon = item.product.addons?.find(a => a.id === parseInt(addonId));
            if (addon) {
              const addonPrice = parseFloat(addon.price) * addonData.quantity * item.quantity;
              calculatedSubtotal += addonPrice;
            }
          }
        });
      }

      // Extra prices
      if (item.extras) {
        Object.entries(item.extras).forEach(([extraId, extraQty]) => {
          const extra = item.product.allExtras?.find(e => e.id === parseInt(extraId));
          if (extra && extraQty > 0) {
            const extraPrice = parseFloat(extra.price) * extraQty * item.quantity;
            calculatedSubtotal += extraPrice;
            
            // Extra discount if available
            if (extra.price_after_discount) {
              const extraDiscount = (parseFloat(extra.price) - parseFloat(extra.price_after_discount)) * extraQty * item.quantity;
              calculatedDiscount += Math.max(0, extraDiscount);
            }
          }
        });
      }

      // Tax calculation based on tax setting
      const taxSetting = item.product.taxes?.setting || 'excluded';
      const taxAmount = parseFloat(item.product.tax_val) || 0;
      
      if (taxSetting === 'included' && taxAmount > 0) {
        calculatedTax += taxAmount * item.quantity;
      }
    });

    const finalTotal = calculatedSubtotal - calculatedDiscount + calculatedTax;

    return {
      subtotal: calculatedSubtotal.toFixed(2),
      totalDiscount: calculatedDiscount.toFixed(2),
      totalTax: calculatedTax.toFixed(2),
      finalTotal: finalTotal.toFixed(2)
    };
  };

  const findOptionInProduct = (product, optionId) => {
    if (!product.variations) return null;
    for (const variation of product.variations) {
      const option = variation.options.find(o => o.id === optionId);
      if (option) return option;
    }
    return null;
  };

  const priceBreakdown = calculatePriceBreakdown();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-96">
        <ShoppingCart className="h-24 w-24 text-gray-300 mb-6" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">Your cart is empty</h3>
        <p className="text-gray-500 mb-6">Add some delicious items to get started!</p>
        <button 
          onClick={() => window.history.back()}
          className="bg-mainColor text-white px-6 py-2 rounded-lg hover:bg-mainColor/90 transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-mainColor">Shopping Cart</h1>
          <p className="text-gray-600 mt-1">{itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart</p>
        </div>
        <button
          onClick={() => dispatch(clearCart())}
          className="flex items-center gap-2 text-red-500 hover:text-red-700 font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {/* Product Image */}
                  <div className="md:w-32 md:h-32 w-full h-48 flex-shrink-0">
                    <img
                      src={item.product.image_link}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5YzlkYWEiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjM1ZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                      }}
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 mb-1">{item.product.name}</h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.product.description}</p>
                        
                        {/* Display note if exists */}
                        {item.note && (
                          <div className="mb-3 p-2 bg-yellow-50 rounded-lg">
                            <span className="text-sm font-medium text-yellow-800">Note: </span>
                            <span className="text-sm text-yellow-700">{item.note}</span>
                          </div>
                        )}
                        
                        {/* Price per item */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg font-bold text-mainColor">
                            {(item.totalPrice / item.quantity).toFixed(2)} EGP
                          </span>
                          {item.product.discount_val > 0 && (
                            <span className="text-red-500 text-sm line-through">
                              {item.product.price} EGP
                            </span>
                          )}
                        </div>

                        {/* Customizations */}
                        <div className="space-y-1 text-sm text-gray-600">
                          {/* Variations */}
                          {item.variations && Object.entries(item.variations).map(([variationId, optionIds]) => {
                            const variation = item.product.variations?.find(v => v.id === parseInt(variationId));
                            if (!variation) return null;
                            
                            return (
                              <div key={variationId} className="flex">
                                <span className="font-medium w-20">{variation.name}:</span>
                                <span>
                                  {Array.isArray(optionIds) ? (
                                    optionIds.map(optionId => {
                                      const option = variation.options.find(o => o.id === optionId);
                                      return option?.name;
                                    }).join(', ')
                                  ) : (
                                    variation.options.find(o => o.id === optionIds)?.name
                                  )}
                                </span>
                              </div>
                            );
                          })}

                          {/* Addons */}
                          {item.addons && Object.entries(item.addons).map(([addonId, addonData]) => {
                            if (!addonData.checked) return null;
                            const addon = item.product.addons?.find(a => a.id === parseInt(addonId));
                            if (!addon) return null;
                            
                            return (
                              <div key={addonId} className="flex">
                                <span className="font-medium w-20">Addon:</span>
                                <span>{addon.name} ({addonData.quantity}x)</span>
                              </div>
                            );
                          })}

                          {/* Extras */}
                          {item.extras && Object.entries(item.extras).map(([extraId, extraQty]) => {
                            if (extraQty <= 0) return null;
                            const extra = item.product.allExtras?.find(e => e.id === parseInt(extraId));
                            if (!extra) return null;
                            
                            return (
                              <div key={extraId} className="flex">
                                <span className="font-medium w-20">Extra:</span>
                                <span>{extra.name} ({extraQty}x)</span>
                              </div>
                            );
                          })}

                          {/* Excludes */}
                          {item.excludes && item.excludes.length > 0 && (
                            <div className="flex">
                              <span className="font-medium w-20">Excluded:</span>
                              <span>
                                {item.excludes.map(excludeId => {
                                  const exclude = item.product.excludes?.find(e => e.id === excludeId);
                                  return exclude?.name;
                                }).join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => dispatch(removeFromCart(item.id))}
                        className="text-gray-400 hover:text-red-500 ml-4 transition-colors"
                        title="Remove item"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center space-x-3 bg-gray-50 rounded-lg px-3 py-1">
                        <button
                          onClick={() => dispatch(decrementQuantity(item.id))}
                          className="p-1 rounded-full hover:bg-white transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-semibold text-lg">{item.quantity}</span>
                        <button
                          onClick={() => dispatch(incrementQuantity(item.id))}
                          className="p-1 rounded-full hover:bg-white transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <span className="text-xl font-bold text-mainColor">
                        {item.totalPrice.toFixed(2)} EGP
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 sticky top-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
            
            {/* Price Breakdown */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({itemCount} items)</span>
                <span>{priceBreakdown.subtotal} EGP</span>
              </div>
              
              {parseFloat(priceBreakdown.totalDiscount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{priceBreakdown.totalDiscount} EGP</span>
                </div>
              )}
              
              {parseFloat(priceBreakdown.totalTax) > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>+{priceBreakdown.totalTax} EGP</span>
                </div>
              )}
              
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>{priceBreakdown.finalTotal} EGP</span>
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <button className="w-full bg-mainColor text-white py-3 rounded-lg font-bold hover:bg-mainColor/90 transition-colors text-lg">
              Proceed to Checkout
            </button>

            {/* Continue Shopping */}
            <button 
              onClick={() => window.history.back()}
              className="w-full border border-mainColor text-mainColor py-3 rounded-lg font-medium hover:bg-mainColor/5 transition-colors mt-3"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;