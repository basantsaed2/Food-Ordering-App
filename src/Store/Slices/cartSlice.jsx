// // Store/Slices/cartSlice.js
// import { createSlice } from '@reduxjs/toolkit';

// // Load cart from localStorage
// const loadCartFromStorage = () => {
//   try {
//     const serializedCart = localStorage.getItem('cart');
//     if (serializedCart === null) {
//       return {
//         items: [],
//         total: 0,
//         itemCount: 0,
//         subtotal: 0,
//         totalDiscount: 0,
//         totalTax: 0
//       };
//     }
//     return JSON.parse(serializedCart);
//   } catch (err) {
//     return {
//       items: [],
//       total: 0,
//       itemCount: 0,
//       subtotal: 0,
//       totalDiscount: 0,
//       totalTax: 0
//     };
//   }
// };

// // Save cart to localStorage
// const saveCartToStorage = (cart) => {
//   try {
//     const serializedCart = JSON.stringify(cart);
//     localStorage.setItem('cart', serializedCart);
//   } catch (err) {
//     console.error('Failed to save cart to localStorage:', err);
//   }
// };

// const cartSlice = createSlice({
//   name: 'cart',
//   initialState: loadCartFromStorage(),
//   reducers: {
//     addToCart: (state, action) => {
//       const { product, quantity, variations, addons, excludes, extras, note } = action.payload;
      
//       const itemId = generateCartItemId(product.id, variations, addons, excludes, extras);
      
//       const existingItem = state.items.find(item => item.id === itemId);
      
//       if (existingItem) {
//         existingItem.quantity += quantity;
//         existingItem.note = note || existingItem.note;
//         existingItem.totalPrice = calculateItemTotal(existingItem);
//       } else {
//         state.items.push({
//           id: itemId,
//           product,
//           quantity,
//           variations,
//           addons,
//           excludes,
//           extras,
//           note: note || '',
//           totalPrice: 0, // Will be calculated
//           basePrice: product.price_after_discount || product.price
//         });
//       }
      
//       updateCartTotals(state);
//       saveCartToStorage(state);
//     },
    
//     updateCartItem: (state, action) => {
//       const { itemId, quantity, variations, addons, excludes, extras, note } = action.payload;
      
//       const item = state.items.find(item => item.id === itemId);
//       if (item) {
//         if (quantity !== undefined) item.quantity = quantity;
//         if (variations) item.variations = variations;
//         if (addons) item.addons = addons;
//         if (excludes) item.excludes = excludes;
//         if (extras) item.extras = extras;
//         if (note !== undefined) item.note = note;
        
//         item.totalPrice = calculateItemTotal(item);
//         updateCartTotals(state);
//         saveCartToStorage(state);
//       }
//     },
    
//     removeFromCart: (state, action) => {
//       const itemId = action.payload;
//       state.items = state.items.filter(item => item.id !== itemId);
//       updateCartTotals(state);
//       saveCartToStorage(state);
//     },
    
//     clearCart: (state) => {
//       state.items = [];
//       updateCartTotals(state);
//       saveCartToStorage(state);
//     },
    
//     incrementQuantity: (state, action) => {
//       const itemId = action.payload;
//       const item = state.items.find(item => item.id === itemId);
//       if (item) {
//         item.quantity += 1;
//         item.totalPrice = calculateItemTotal(item);
//         updateCartTotals(state);
//         saveCartToStorage(state);
//       }
//     },
    
//     decrementQuantity: (state, action) => {
//       const itemId = action.payload;
//       const item = state.items.find(item => item.id === itemId);
//       if (item && item.quantity > 1) {
//         item.quantity -= 1;
//         item.totalPrice = calculateItemTotal(item);
//         updateCartTotals(state);
//         saveCartToStorage(state);
//       }
//     },
    
//     updateItemNote: (state, action) => {
//       const { itemId, note } = action.payload;
//       const item = state.items.find(item => item.id === itemId);
//       if (item) {
//         item.note = note;
//         saveCartToStorage(state);
//       }
//     },
    
//     // Initialize cart from localStorage
//     initializeCart: (state) => {
//       const savedCart = loadCartFromStorage();
//       state.items = savedCart.items;
//       updateCartTotals(state);
//     }
//   }
// });

// // Helper functions
// const generateCartItemId = (productId, variations, addons, excludes, extras) => {
//   const variationsStr = variations ? Object.entries(variations)
//     .sort(([a], [b]) => a.localeCompare(b))
//     .map(([key, value]) => `${key}:${Array.isArray(value) ? value.sort().join(',') : value}`)
//     .join('|') : '';
  
//   const addonsStr = addons ? Object.entries(addons)
//     .sort(([a], [b]) => a.localeCompare(b))
//     .map(([key, value]) => `${key}:${JSON.stringify(value)}`)
//     .join('|') : '';
  
//   const excludesStr = excludes ? excludes.sort().join(',') : '';
  
//   const extrasStr = extras ? Object.entries(extras)
//     .sort(([a], [b]) => a.localeCompare(b))
//     .map(([key, value]) => `${key}:${value}`)
//     .join('|') : '';
  
//   return `${productId}|${variationsStr}|${addonsStr}|${excludesStr}|${extrasStr}`;
// };

// const calculateItemTotal = (item) => {
//   let total = parseFloat(item.basePrice);
  
//   // Add variation prices
//   if (item.variations) {
//     Object.values(item.variations).forEach(optionIds => {
//       if (Array.isArray(optionIds)) {
//         optionIds.forEach(optionId => {
//           const option = findOptionInProduct(item.product, optionId);
//           if (option) total += parseFloat(option.price);
//         });
//       } else {
//         const option = findOptionInProduct(item.product, optionIds);
//         if (option) total += parseFloat(option.price);
//       }
//     });
//   }
  
//   // Add addon prices
//   if (item.addons) {
//     Object.entries(item.addons).forEach(([addonId, addonData]) => {
//       if (addonData.checked) {
//         const addon = item.product.addons?.find(a => a.id === parseInt(addonId));
//         if (addon) {
//           const addonQty = addonData.quantity || 1;
//           total += parseFloat(addon.price) * addonQty;
//         }
//       }
//     });
//   }
  
//   // Add extra prices
//   if (item.extras) {
//     Object.entries(item.extras).forEach(([extraId, extraQty]) => {
//       const extra = item.product.allExtras?.find(e => e.id === parseInt(extraId));
//       if (extra && extraQty > 0) {
//         total += parseFloat(extra.price_after_discount || extra.price) * extraQty;
//       }
//     });
//   }
  
//   return total * item.quantity;
// };

// const findOptionInProduct = (product, optionId) => {
//   if (!product.variations) return null;
//   for (const variation of product.variations) {
//     const option = variation.options.find(o => o.id === optionId);
//     if (option) return option;
//   }
//   return null;
// };

// const updateCartTotals = (state) => {
//   let subtotal = 0;
//   let totalDiscount = 0;
//   let totalTax = 0;
  
//   state.items.forEach(item => {
//     // Calculate item base price without tax
//     let itemSubtotal = parseFloat(item.product.price) * item.quantity;
    
//     // Calculate discount
//     const itemDiscountPrice = parseFloat(item.product.price_after_discount || item.product.price) * item.quantity;
//     const itemDiscount = itemSubtotal - itemDiscountPrice;
//     totalDiscount += Math.max(0, itemDiscount);
    
//     // Add variation prices
//     if (item.variations) {
//       Object.values(item.variations).forEach(optionIds => {
//         if (Array.isArray(optionIds)) {
//           optionIds.forEach(optionId => {
//             const option = findOptionInProduct(item.product, optionId);
//             if (option) itemSubtotal += parseFloat(option.price) * item.quantity;
//           });
//         } else {
//           const option = findOptionInProduct(item.product, optionIds);
//           if (option) itemSubtotal += parseFloat(option.price) * item.quantity;
//         }
//       });
//     }
    
//     // Add addon prices
//     if (item.addons) {
//       Object.entries(item.addons).forEach(([addonId, addonData]) => {
//         if (addonData.checked) {
//           const addon = item.product.addons?.find(a => a.id === parseInt(addonId));
//           if (addon) {
//             const addonPrice = parseFloat(addon.price) * addonData.quantity * item.quantity;
//             itemSubtotal += addonPrice;
//           }
//         }
//       });
//     }
    
//     // Add extra prices
//     if (item.extras) {
//       Object.entries(item.extras).forEach(([extraId, extraQty]) => {
//         const extra = item.product.allExtras?.find(e => e.id === parseInt(extraId));
//         if (extra && extraQty > 0) {
//           const extraPrice = parseFloat(extra.price) * extraQty * item.quantity;
//           itemSubtotal += extraPrice;
//         }
//       });
//     }
    
//     subtotal += itemSubtotal;
    
//     // Calculate tax based on tax setting
//     const taxSetting = item.product.taxes?.setting || 'excluded';
//     const taxAmount = parseFloat(item.product.tax_val) || 0;
    
//     if (taxSetting === 'included' && taxAmount > 0) {
//       totalTax += taxAmount * item.quantity;
//     }
//   });
  
//   state.subtotal = parseFloat(subtotal.toFixed(2));
//   state.totalDiscount = parseFloat(totalDiscount.toFixed(2));
//   state.totalTax = parseFloat(totalTax.toFixed(2));
//   state.total = parseFloat((subtotal - totalDiscount + totalTax).toFixed(2));
//   state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
// };

// export const { 
//   addToCart, 
//   updateCartItem, 
//   removeFromCart, 
//   clearCart, 
//   incrementQuantity, 
//   decrementQuantity,
//   updateItemNote,
//   initializeCart
// } = cartSlice.actions;

// export default cartSlice.reducer;

// Updated cartSlice.js - fix for new items totalPrice calculation
import { createSlice } from '@reduxjs/toolkit';

// Load cart from localStorage
const loadCartFromStorage = () => {
  try {
    const serializedCart = localStorage.getItem('cart');
    if (serializedCart === null) {
      return {
        items: [],
        total: 0,
        itemCount: 0,
        subtotal: 0,
        totalDiscount: 0,
        totalTax: 0
      };
    }
    return JSON.parse(serializedCart);
  } catch (err) {
    return {
      items: [],
      total: 0,
      itemCount: 0,
      subtotal: 0,
      totalDiscount: 0,
      totalTax: 0
    };
  }
};

// Save cart to localStorage
const saveCartToStorage = (cart) => {
  try {
    const serializedCart = JSON.stringify(cart);
    localStorage.setItem('cart', serializedCart);
  } catch (err) {
    console.error('Failed to save cart to localStorage:', err);
  }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: loadCartFromStorage(),
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity, variations, addons, excludes, extras, note } = action.payload;
      
      const itemId = generateCartItemId(product.id, variations, addons, excludes, extras);
      
      const existingItem = state.items.find(item => item.id === itemId);
      
      if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.note = note || existingItem.note;
        existingItem.totalPrice = calculateItemTotal(existingItem);
      } else {
        const newItem = {
          id: itemId,
          product,
          quantity,
          variations,
          addons,
          excludes,
          extras,
          note: note || '',
          totalPrice: 0, // Will be calculated below
          basePrice: product.price_after_discount || product.price
        };
        newItem.totalPrice = calculateItemTotal(newItem);
        state.items.push(newItem);
      }
      
      updateCartTotals(state);
      saveCartToStorage(state);
    },
    
    updateCartItem: (state, action) => {
      const { itemId, quantity, variations, addons, excludes, extras, note } = action.payload;
      
      const item = state.items.find(item => item.id === itemId);
      if (item) {
        if (quantity !== undefined) item.quantity = quantity;
        if (variations) item.variations = variations;
        if (addons) item.addons = addons;
        if (excludes) item.excludes = excludes;
        if (extras) item.extras = extras;
        if (note !== undefined) item.note = note;
        
        item.totalPrice = calculateItemTotal(item);
        updateCartTotals(state);
        saveCartToStorage(state);
      }
    },
    
    removeFromCart: (state, action) => {
      const itemId = action.payload;
      state.items = state.items.filter(item => item.id !== itemId);
      updateCartTotals(state);
      saveCartToStorage(state);
    },
    
    clearCart: (state) => {
      state.items = [];
      updateCartTotals(state);
      saveCartToStorage(state);
    },
    
    incrementQuantity: (state, action) => {
      const itemId = action.payload;
      const item = state.items.find(item => item.id === itemId);
      if (item) {
        item.quantity += 1;
        item.totalPrice = calculateItemTotal(item);
        updateCartTotals(state);
        saveCartToStorage(state);
      }
    },
    
    decrementQuantity: (state, action) => {
      const itemId = action.payload;
      const item = state.items.find(item => item.id === itemId);
      if (item && item.quantity > 1) {
        item.quantity -= 1;
        item.totalPrice = calculateItemTotal(item);
        updateCartTotals(state);
        saveCartToStorage(state);
      }
    },
    
    updateItemNote: (state, action) => {
      const { itemId, note } = action.payload;
      const item = state.items.find(item => item.id === itemId);
      if (item) {
        item.note = note;
        saveCartToStorage(state);
      }
    },
    
    // Initialize cart from localStorage
    initializeCart: (state) => {
      const savedCart = loadCartFromStorage();
      state.items = savedCart.items;
      updateCartTotals(state);
    }
  }
});

// Helper functions
const generateCartItemId = (productId, variations, addons, excludes, extras) => {
  const variationsStr = variations ? Object.entries(variations)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${Array.isArray(value) ? value.sort().join(',') : value}`)
    .join('|') : '';
  
  const addonsStr = addons ? Object.entries(addons)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${JSON.stringify(value)}`)
    .join('|') : '';
  
  const excludesStr = excludes ? excludes.sort().join(',') : '';
  
  const extrasStr = extras ? Object.entries(extras)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}`)
    .join('|') : '';
  
  return `${productId}|${variationsStr}|${addonsStr}|${excludesStr}|${extrasStr}`;
};

const calculateItemTotal = (item) => {
  let total = parseFloat(item.basePrice);
  
  // Add variation prices
  if (item.variations) {
    Object.values(item.variations).forEach(optionIds => {
      if (Array.isArray(optionIds)) {
        optionIds.forEach(optionId => {
          const option = findOptionInProduct(item.product, optionId);
          if (option) total += parseFloat(option.price);
        });
      } else {
        const option = findOptionInProduct(item.product, optionIds);
        if (option) total += parseFloat(option.price);
      }
    });
  }
  
  // Add addon prices
  if (item.addons) {
    Object.entries(item.addons).forEach(([addonId, addonData]) => {
      if (addonData.checked) {
        const addon = item.product.addons?.find(a => a.id === parseInt(addonId));
        if (addon) {
          const addonQty = addonData.quantity || 1;
          total += parseFloat(addon.price) * addonQty;
        }
      }
    });
  }
  
  // Add extra prices
  if (item.extras) {
    Object.entries(item.extras).forEach(([extraId, extraQty]) => {
      const extra = item.product.allExtras?.find(e => e.id === parseInt(extraId));
      if (extra && extraQty > 0) {
        total += parseFloat(extra.price_after_discount || extra.price) * extraQty;
      }
    });
  }
  
  return total * item.quantity;
};

const findOptionInProduct = (product, optionId) => {
  if (!product.variations) return null;
  for (const variation of product.variations) {
    const option = variation.options.find(o => o.id === optionId);
    if (option) return option;
  }
  return null;
};

const updateCartTotals = (state) => {
  let subtotal = 0;
  let totalDiscount = 0;
  let totalTax = 0;
  
  state.items.forEach(item => {
    // Calculate item base price without tax
    let itemSubtotal = parseFloat(item.product.price) * item.quantity;
    
    // Calculate discount
    const itemDiscountPrice = parseFloat(item.product.price_after_discount || item.product.price) * item.quantity;
    const itemDiscount = itemSubtotal - itemDiscountPrice;
    totalDiscount += Math.max(0, itemDiscount);
    
    // Add variation prices
    if (item.variations) {
      Object.values(item.variations).forEach(optionIds => {
        if (Array.isArray(optionIds)) {
          optionIds.forEach(optionId => {
            const option = findOptionInProduct(item.product, optionId);
            if (option) itemSubtotal += parseFloat(option.price) * item.quantity;
          });
        } else {
          const option = findOptionInProduct(item.product, optionIds);
          if (option) itemSubtotal += parseFloat(option.price) * item.quantity;
        }
      });
    }
    
    // Add addon prices
    if (item.addons) {
      Object.entries(item.addons).forEach(([addonId, addonData]) => {
        if (addonData.checked) {
          const addon = item.product.addons?.find(a => a.id === parseInt(addonId));
          if (addon) {
            const addonPrice = parseFloat(addon.price) * addonData.quantity * item.quantity;
            itemSubtotal += addonPrice;
          }
        }
      });
    }
    
    // Add extra prices
    if (item.extras) {
      Object.entries(item.extras).forEach(([extraId, extraQty]) => {
        const extra = item.product.allExtras?.find(e => e.id === parseInt(extraId));
        if (extra && extraQty > 0) {
          const extraPrice = parseFloat(extra.price) * extraQty * item.quantity;
          itemSubtotal += extraPrice;
        }
      });
    }
    
    subtotal += itemSubtotal;
    
    // Calculate tax based on tax setting
    const taxSetting = item.product.taxes?.setting || 'excluded';
    const taxAmount = parseFloat(item.product.tax_val) || 0;
    
    if (taxSetting === 'included' && taxAmount > 0) {
      totalTax += taxAmount * item.quantity;
    }
  });
  
  state.subtotal = parseFloat(subtotal.toFixed(2));
  state.totalDiscount = parseFloat(totalDiscount.toFixed(2));
  state.totalTax = parseFloat(totalTax.toFixed(2));
  state.total = parseFloat((subtotal - totalDiscount + totalTax).toFixed(2));
  state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
};

export const { 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart, 
  incrementQuantity, 
  decrementQuantity,
  updateItemNote,
  initializeCart
} = cartSlice.actions;

export default cartSlice.reducer;