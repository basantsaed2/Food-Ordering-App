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
      productsAvailableWithLocation: 'Products may be available when you select a specific location.',
      
      // Login Page translations
      deliciousMealsDelivered: 'Delicious meals delivered to your door',
      signInToContinue: 'Sign in to continue to',
      emailAddress: 'Email Address',
      enterYourEmail: 'Enter your email',
      password: 'Password',
      enterYourPassword: 'Enter your password',
      forgotPassword: 'Forgot Password?',
      loggingIn: 'Logging in...',
      dontHaveAccount: 'Don\'t have an account?',
      signUp: 'Sign Up',
      backToLogin: 'Back to Login',
      resetPassword: 'Reset Password',
      enterVerificationMethod: 'Enter your {{method}} to receive a verification code',
      phoneNumber: 'Phone Number',
      enterYourPhone: 'Enter your phone number',
      sending: 'Sending...',
      sendVerificationCode: 'Send Verification Code',
      back: 'Back',
      verificationCode: 'Verification Code',
      verificationCodeSentTo: 'We\'ve sent a 6-digit code to your {{method}}',
      verifying: 'Verifying...',
      verifyCode: 'Verify Code',
      didntReceiveCode: 'Didn\'t receive the code?',
      resend: 'Resend',
      setNewPassword: 'Set New Password',
      enterNewPassword: 'Please enter your new password',
      newPassword: 'New Password',
      confirmNewPassword: 'Confirm New Password',
      resetting: 'Resetting...',
      
      // Validation messages
      validEmailRequired: 'Please enter a valid email address',
      passwordRequired: 'Password is required',
      validPhoneRequired: 'Please enter a valid phone number',
      valid5DigitCodeRequired: 'Please enter a valid 5-digit code',
      newPasswordRequired: 'New password is required',
      passwordMinLength: 'Password must be at least 6 characters',
      passwordsDoNotMatch: 'Passwords do not match',
      
      // Success messages
      verificationCodeSent: 'Verification code sent to your {{method}}',
      codeVerifiedSuccessfully: 'Code verified successfully. Please set your new password.',
      passwordResetSuccessfully: 'Password reset successfully. You can now login with your new password.',
      
      // Product Details translations
      price: 'Price',
      taxIncluded: 'Tax Included',
      select: 'Select',
      addons: 'Add-ons',
      quantity: 'Quantity',
      quantityFixed: 'Quantity: 1 (fixed)',
      availableExtras: 'Available Extras',
      min: 'Min',
      max: 'Max',
      noLimit: 'No limit',
      excludeItems: 'Exclude Items',
      specialInstructions: 'Special Instructions',
      addSpecialInstructions: 'Add special instructions...',
      characters: 'characters',
      totalPrice: 'Total Price',
      addToCart: 'Add to Cart',
      completeSelection: 'Complete Selection',
      pleaseLogin: 'Please login first',
      pleaseLoginFirst: 'Please login first',
      pleaseSelectOrderTypeFirst: 'Please select order type first',
      addedToCart: 'added to cart',
      addedToFavorites: 'added to favorites',
      removedFromFavorites: 'removed from favorites'
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
      productsAvailableWithLocation: 'قد تتوفر المنتجات عند اختيار موقع محدد.',
      
      // Login Page translations
      deliciousMealsDelivered: 'وجبات لذيذة تصل إلى باب منزلك',
      signInToContinue: 'سجل الدخول للمتابعة إلى',
      emailAddress: 'البريد الإلكتروني',
      enterYourEmail: 'أدخل بريدك الإلكتروني',
      password: 'كلمة المرور',
      enterYourPassword: 'أدخل كلمة المرور',
      forgotPassword: 'نسيت كلمة المرور؟',
      loggingIn: 'جاري تسجيل الدخول...',
      dontHaveAccount: 'ليس لديك حساب؟',
      signUp: 'إنشاء حساب',
      backToLogin: 'العودة لتسجيل الدخول',
      resetPassword: 'إعادة تعيين كلمة المرور',
      enterVerificationMethod: 'أدخل {{method}} الخاص بك لتلقي رمز التحقق',
      phoneNumber: 'رقم الهاتف',
      enterYourPhone: 'أدخل رقم هاتفك',
      sending: 'جاري الإرسال...',
      sendVerificationCode: 'إرسال رمز التحقق',
      back: 'رجوع',
      verificationCode: 'رمز التحقق',
      verificationCodeSentTo: 'لقد أرسلنا رمز مكون من 6 أرقام إلى {{method}} الخاص بك',
      verifying: 'جاري التحقق...',
      verifyCode: 'تحقق من الرمز',
      didntReceiveCode: 'لم تستلم الرمز؟',
      resend: 'إعادة الإرسال',
      setNewPassword: 'تعيين كلمة مرور جديدة',
      enterNewPassword: 'يرجى إدخال كلمة المرور الجديدة',
      newPassword: 'كلمة المرور الجديدة',
      confirmNewPassword: 'تأكيد كلمة المرور الجديدة',
      resetting: 'جاري إعادة التعيين...',
      
      // Validation messages
      validEmailRequired: 'يرجى إدخال بريد إلكتروني صحيح',
      passwordRequired: 'كلمة المرور مطلوبة',
      validPhoneRequired: 'يرجى إدخال رقم هاتف صحيح',
      valid5DigitCodeRequired: 'يرجى إدخال رمز مكون من 5 أرقام',
      newPasswordRequired: 'كلمة المرور الجديدة مطلوبة',
      passwordMinLength: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل',
      passwordsDoNotMatch: 'كلمات المرور غير متطابقة',
      
      // Success messages
      verificationCodeSent: 'تم إرسال رمز التحقق إلى {{method}} الخاص بك',
      codeVerifiedSuccessfully: 'تم التحقق من الرمز بنجاح. يرجى تعيين كلمة المرور الجديدة.',
      passwordResetSuccessfully: 'تم إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.',
      
      // Product Details translations
      price: 'السعر',
      taxIncluded: 'الضريبة مشمولة',
      select: 'اختر',
      addons: 'الإضافات',
      quantity: 'الكمية',
      quantityFixed: 'الكمية: 1 (ثابتة)',
      availableExtras: 'الإضافات المتاحة',
      min: 'الحد الأدنى',
      max: 'الحد الأقصى',
      noLimit: 'لا يوجد حد',
      excludeItems: 'استبعاد العناصر',
      specialInstructions: 'تعليمات خاصة',
      addSpecialInstructions: 'أضف تعليمات خاصة...',
      characters: 'حرف',
      totalPrice: 'السعر الإجمالي',
      addToCart: 'أضف إلى السلة',
      completeSelection: 'إكمال الاختيار',
      pleaseLogin: 'يرجى تسجيل الدخول أولاً',
      pleaseLoginFirst: 'يرجى تسجيل الدخول أولاً',
      pleaseSelectOrderTypeFirst: 'يرجى اختيار نوع الطلب أولاً',
      addedToCart: 'تمت الإضافة إلى السلة',
      addedToFavorites: 'تمت الإضافة إلى المفضلة',
      removedFromFavorites: 'تم الإزالة من المفضلة'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;