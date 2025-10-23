import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Existing translations
      brandName: 'Food2Go',
      branches: 'Branches',
      menu: 'Menu',
      orderOnline: 'Order Online',
      orderNow: 'Order Now',
      contactUs: 'Contact Us',
      profile: 'Profile',
      login: 'Login',
      favorites: 'Favorites',
      welcomeBack: 'Welcome Back!',
      manageAccount: 'Manage your account',
      loginSignUp: 'Login / Sign Up',
      happyCustomers: '10K+ Happy Customers',
      user: 'User',
      myProfile: 'My Profile',
      myOrders: 'My Orders',
      logout: 'Logout',
      Poweredby: 'Powered by',
      Orders: 'Orders',
      
      // Categories translations
      categories: 'Categories',
      noCategoriesAvailable: 'No categories available',
      scrollLeft: 'Scroll left',
      scrollRight: 'Scroll right',
      autoScroll: 'Auto-scroll',
      on: 'on',
      paused: 'paused',
      
      // Products translations
      offersProducts: 'Offers Products',
      recommendedProducts: 'Recommended Products',
      speciallySelectedForYou: 'Our specially selected items just for you',
      exclusiveOfferItem: 'Exclusive offer item',
      deliciousFoodItem: 'Delicious food item',
      off: 'OFF',
      recommended: 'Recommended',
      save: 'Save',
      egp: 'EGP',
      
      // Products Page translations
      subcategories: 'Subcategories',
      all: 'All',
      note: 'Note',
      locationWarningMessage: 'Showing all products. For location-specific availability and pricing, please select a delivery address or branch.',
      searchProductsPlaceholder: 'Search products...',
      noProductsMatchSearch: 'No products match your search.',
      noProductsInCategory: 'No products found in this category.',
      selectCategoryToViewProducts: 'Please select a category to view products.',
      productsAvailableWithLocation: 'Products may be available when you select a specific location.'
    }
  },
  ar: {
    translation: {
      // Existing translations
      brandName: 'فود تو جو',
      branches: 'الفروع',
      menu: 'القائمة',
      orderNow: 'اطلب الآن',
      orderOnline: 'اطلب أونلاين',
      contactUs: 'تواصل معنا',
      profile: 'الملف الشخصي',
      login: 'تسجيل الدخول',
      favorites: 'المفضلة',
      welcomeBack: 'مرحباً بعودتك!',
      manageAccount: 'إدارة حسابك',
      loginSignUp: 'تسجيل الدخول / إنشاء حساب',
      happyCustomers: '10 آلاف+ عميل سعيد',
      user: 'مستخدم',
      myProfile: 'ملفي الشخصي',
      myOrders: 'طلباتي',
      logout: 'تسجيل الخروج',
      Poweredby: 'مدعوم من',
      Orders: 'الطلبات',
      
      // Categories translations
      categories: 'الفئات',
      noCategoriesAvailable: 'لا توجد فئات متاحة',
      scrollLeft: 'التمرير لليسار',
      scrollRight: 'التمرير لليمين',
      autoScroll: 'التمرير التلقائي',
      on: 'تشغيل',
      paused: 'متوقف',
      
      // Products translations
      offersProducts: 'المنتجات المعروضة',
      recommendedProducts: 'المنتجات الموصى بها',
      speciallySelectedForYou: 'منتجات مختارة خصيصاً لك',
      exclusiveOfferItem: 'عنصر عرض حصري',
      deliciousFoodItem: 'صنف طعام لذيذ',
      off: 'خصم',
      recommended: 'موصى به',
      save: 'وفر',
      egp: 'ج.م',
      
      // Products Page translations
      subcategories: 'الفئات الفرعية',
      all: 'الكل',
      note: 'ملاحظة',
      locationWarningMessage: 'عرض جميع المنتجات. للحصول على الأسعار والتوافر حسب الموقع، يرجى اختيار عنوان التوصيل أو الفرع.',
      searchProductsPlaceholder: 'ابحث في المنتجات...',
      noProductsMatchSearch: 'لا توجد منتجات تطابق بحثك.',
      noProductsInCategory: 'لا توجد منتجات في هذه الفئة.',
      selectCategoryToViewProducts: 'يرجى اختيار فئة لعرض المنتجات.',
      productsAvailableWithLocation: 'قد تتوفر المنتجات عند اختيار موقع محدد.'
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  keySeparator: false,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;