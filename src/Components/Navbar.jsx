import React, { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart, Heart, User, Phone, MapPin, Globe, Star, ChefHat } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { setLanguage, setLanguages } from '../Store/Slices/languageSlice';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const user = useSelector(state => state.user?.data?.user);
    const mainData = useSelector(state => state.mainData?.data);
    const cart = useSelector(state => state.cart);
    const languages = useSelector(state => state.language?.data || []);
    const selectedLanguage = useSelector(state => state.language?.selected || 'en');

    console.log("user" , user)

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Calculate real cart count
    const cartCount = cart?.itemCount || 0;
    // Calculate real favorites count (you might need to add this to your Redux store)
    const favCount = 0; // You'll need to implement this based on your favorites state

    // Initialize languages on component mount
    useEffect(() => {
        const languageData = [
            { code: 'en', name: 'English', flag: '🇺🇸' },
            { code: 'ar', name: 'العربية', flag: '🇸🇦' }
        ];
        dispatch(setLanguages(languageData));
    }, [dispatch]);

    // Sync login state with user data
    useEffect(() => {
        setIsLoggedIn(!!user?.token);
    }, [user?.token]);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Sync local state with Redux selected language
    useEffect(() => {
        if (selectedLanguage) {
            i18n.changeLanguage(selectedLanguage);
        }
    }, [selectedLanguage, i18n]);

    // Find current language object from languages array
    const currentLanguageObj = languages.find(lang => lang.code === selectedLanguage) || {};
    const currentLanguageName = currentLanguageObj.name || selectedLanguage.toUpperCase();

    const menuItems = [
        {
            icon: MapPin,
            i18nKey: 'branches',
            path: '/branches'
        },
        {
            icon: ChefHat,
            i18nKey: 'menu',
            path: '/menu'
        },
        {
            icon: ShoppingCart,
            i18nKey: 'orderOnline',
            path: '/order_online'
        },
    ];

    const handleLanguageChange = (newLangCode) => {
        dispatch(setLanguage(newLangCode));
    };

    // Handle navigation
    const handleNavigation = (path) => {
        navigate(path);
        setIsMobileMenuOpen(false);
    };

    // Handle login/logout
    const handleLogin = () => {
        navigate('/login');
        setIsMobileMenuOpen(false);
    };

    const handleLogout = () => {
        // Add your logout logic here (clear user data from Redux, etc.)
        // dispatch(logout());
        navigate('/login');
        setIsMobileMenuOpen(false);
    };

    const handleProfile = () => {
        navigate('/profile');
        setIsMobileMenuOpen(false);
    };

    // Function to render logo with name
    const renderLogo = () => {
        return (
            <div className="flex items-center space-x-3">
                <div className="bg-white rounded-full p-2 shadow-md flex items-center justify-center">
                    {mainData?.logo_link ? (
                        <img
                            src={mainData.logo_link}
                            alt={mainData?.name || "Logo"}
                            className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    <ChefHat 
                        className="h-8 w-8 sm:h-10 sm:w-10" 
                        style={{ 
                            color: 'var(--color-main)', 
                            display: mainData?.logo_link ? 'none' : 'flex' 
                        }} 
                    />
                </div>
                <span className="text-white font-bold text-xl lg:text-2xl">
                    {mainData?.name || t('brandName')}
                </span>
            </div>
        );
    };

    // Function to render user profile image
    const renderUserProfile = () => {
        if (!isLoggedIn) return null;

        return (
            <div className="relative">
                {user?.profile_image ? (
                    <img
                        src={user.profile_image}
                        alt={user.f_name}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                    />
                ) : null}
                <div 
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center"
                    style={{ display: user?.profile_image ? 'none' : 'flex' }}
                >
                    <User 
                        className="h-5 w-5 sm:h-6 sm:w-6" 
                        style={{ color: 'var(--color-main)' }} 
                    />
                </div>
            </div>
        );
    };

    return (
        <>
            {/* Navbar with lower z-index */}
            <nav className="shadow-lg relative z-[9999]" style={{ backgroundColor: 'var(--color-main)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16 lg:h-20">
                        {/* Logo with Name */}
                        <Link to="/" className="flex-shrink-0">
                            {renderLogo()}
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden xl:flex xl:items-center xl:space-x-8">
                            {menuItems.map((item, index) => (
                                <Link
                                    key={index}
                                    to={item.path}
                                    className="text-white hover:text-gray-200 transition-colors duration-200 font-medium flex items-center space-x-2 group"
                                >
                                    <item.icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                    <span>{t(item.i18nKey)}</span>
                                </Link>
                            ))}
                        </div>

                        {/* Desktop Right Side Icons */}
                        <div className="hidden xl:flex xl:items-center lg:space-x-4">
                            {/* Favorites */}
                            <Link 
                                to="/favorite_product" 
                                className="text-white hover:text-gray-200 transition-colors relative"
                            >
                                <Heart className="h-6 w-6" />
                                {favCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        {favCount}
                                    </span>
                                )}
                            </Link>

                            {/* Cart */}
                            <Link 
                                to="/cart" 
                                className="text-white hover:text-gray-200 transition-colors relative"
                            >
                                <ShoppingCart className="h-6 w-6" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>

                            {/* Language Toggle - Desktop */}
                            <div className="relative">
                                <button
                                    onClick={() => {
                                        // Toggle between available languages
                                        const currentIndex = languages.findIndex(lang => lang.code === selectedLanguage);
                                        const nextIndex = (currentIndex + 1) % languages.length;
                                        const nextLang = languages[nextIndex]?.code || 'en';
                                        handleLanguageChange(nextLang);
                                    }}
                                    className="text-white hover:text-gray-200 transition-colors flex items-center space-x-1 bg-white bg-opacity-20 rounded-full px-3 py-1 group"
                                >
                                    <Globe className="h-4 w-4" />
                                    <span className="font-medium">{currentLanguageName}</span>
                                </button>

                                {/* Language Dropdown - Higher z-index */}
                                {languages.length > 1 && (
                                    <div className="absolute top-full left-0 mt-2 w-32 bg-white rounded-lg shadow-lg py-1 z-60 hidden group-hover:block">
                                        {languages.map((lang) => (
                                            <button
                                                key={lang.code}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleLanguageChange(lang.code);
                                                }}
                                                className={`w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 ${
                                                    selectedLanguage === lang.code ? 'bg-gray-100 font-medium' : ''
                                                }`}
                                            >
                                                <span>{lang.flag || ''}</span>
                                                <span>{lang.name}</span>
                                                {selectedLanguage === lang.code && (
                                                    <span className="ml-auto text-green-500">✓</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Profile/Login */}
                            {isLoggedIn ? (
                                <div className="relative group">
                                    <button 
                                        onClick={handleProfile}
                                        className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
                                    >
                                        {renderUserProfile()}
                                        <span className="font-medium hidden lg:block">
                                            {user?.name || t('profile')}
                                        </span>
                                    </button>
                                    
                                    {/* Profile Dropdown - Higher z-index */}
                                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-60 hidden group-hover:block">
                                        <Link
                                            to="/profile"
                                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                                        >
                                            <User className="h-4 w-4" />
                                            <span>{t('myProfile')}</span>
                                        </Link>
                                        <Link
                                            to="/order_online"
                                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                                        >
                                            <ShoppingCart className="h-4 w-4" />
                                            <span>{t('myOrders')}</span>
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center space-x-2"
                                        >
                                            <span>🚪</span>
                                            <span>{t('logout')}</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={handleLogin}
                                    className="text-white px-4 py-2 rounded-full font-medium hover:bg-white hover:bg-opacity-20 transition-colors"
                                >
                                    {t('login')}
                                </button>
                            )}
                        </div>

                        {/* Mobile: Cart, Favorites, Language, Menu Button */}
                        <div className="xl:hidden flex items-center space-x-2">
                            {/* Favorites Icon */}
                            <Link to="/favorite_product" className="text-white relative">
                                <Heart className="h-5 w-5" />
                                {favCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                        {favCount}
                                    </span>
                                )}
                            </Link>

                            {/* Cart Icon */}
                            <Link to="/cart" className="text-white relative">
                                <ShoppingCart className="h-5 w-5" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>

                            {/* Language Toggle - Mobile */}
                            <button
                                onClick={() => {
                                    const currentIndex = languages.findIndex(lang => lang.code === selectedLanguage);
                                    const nextIndex = (currentIndex + 1) % languages.length;
                                    const nextLang = languages[nextIndex]?.code || 'en';
                                    handleLanguageChange(nextLang);
                                }}
                                className="text-white bg-white bg-opacity-20 rounded-full px-2 py-1 text-xs font-medium"
                            >
                                {currentLanguageName}
                            </button>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={toggleMobileMenu}
                                className="text-white hover:text-gray-200 transition-colors"
                            >
                                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Sidebar - Higher z-index */}
            <div className={`fixed inset-0 z-50 xl:hidden ${isMobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
                {/* Backdrop */}
                <div
                    className={`absolute inset-0 bg-black transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-50' : 'opacity-0'
                        }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                />

                {/* Sidebar */}
                <div className={`absolute top-0 left-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}>
                    <div className="p-6">
                        {/* Sidebar Header */}
                        <div className="flex items-center justify-between mb-8">
                            <Link to="/" className="flex items-center">
                                {renderLogo()}
                            </Link>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Profile Section */}
                        <div className="mb-8 pb-6 border-b border-gray-200">
                            {isLoggedIn ? (
                                <div 
                                    onClick={handleProfile}
                                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    {renderUserProfile()}
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {user?.name || t('user')}
                                        </p>
                                        <p className="text-gray-600 text-sm">
                                            {user?.email || t('manageAccount')}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={handleLogin}
                                    className="w-full text-white py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
                                    style={{ backgroundColor: 'var(--color-main)' }}
                                >
                                    {t('loginSignUp')}
                                </button>
                            )}
                        </div>

                        {/* Menu Items */}
                        <div className="space-y-1 mb-4">
                            {menuItems.map((item, index) => (
                                <Link
                                    key={index}
                                    to={item.path}
                                    className="w-full flex items-center space-x-4 text-left p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center group-hover:bg-opacity-20 transition-colors" style={{ backgroundColor: 'var(--color-main)', opacity: 0.1 }}>
                                        <item.icon className="h-5 w-5" style={{ color: 'var(--color-main)' }} />
                                    </div>
                                    <span className="text-gray-800 font-medium">
                                        {t(item.i18nKey)}
                                    </span>
                                </Link>
                            ))}

                            {/* Favorites */}
                            <Link
                                to="/favorite_product"
                                className=" w-full flex items-center space-x-4 text-left p-3 rounded-lg hover:bg-gray-50 transition-colors group relative"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center group-hover:bg-opacity-20 transition-colors" style={{ backgroundColor: 'var(--color-main)', opacity: 0.1 }}>
                                    <Heart className="h-5 w-5" style={{ color: 'var(--color-main)' }} />
                                    {favCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                            {favCount}
                                        </span>
                                    )}
                                </div>
                                <span className="text-gray-800 font-medium">
                                    {t('favorites')}
                                </span>
                            </Link>

                        </div>

                        {/* Footer */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <div className="flex items-center justify-center space-x-4">
                                <div className="flex items-center space-x-1 text-gray-600">
                                    <Star className="h-4 w-4 text-yellow-400" />
                                    <span className="text-sm">4.8</span>
                                </div>
                                <div className="text-gray-400">•</div>
                                <span className="text-gray-600 text-sm">
                                    {t('happyCustomers')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;