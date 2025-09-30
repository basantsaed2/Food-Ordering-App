import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ShoppingCart, Heart, User, Phone, MapPin, Globe, Star, ChefHat, LogOut, Settings, Package } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { setLanguage, setLanguages } from '../Store/Slices/languageSlice';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import mainLogo from '../assets/Images/mainLogo.jpeg'
import { useAuth } from '../Context/Auth';

const Navbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const user = useSelector(state => state.user?.data?.user);
    const mainData = useSelector(state => state.mainData?.data);
    const cart = useSelector(state => state.cart);
    const languages = useSelector(state => state.language?.data || []);
    const selectedLanguage = useSelector(state => state.language?.selected || 'en');
    const [pages] = useState(['/login', '/signup']);
    const auth = useAuth();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

    // Refs for click outside detection
    const profileDropdownRef = useRef(null);
    const languageDropdownRef = useRef(null);

    // Calculate real cart count
    const cartCount = cart?.itemCount || 0;
    // // Calculate real favorites count
    // const favCount = 0;

    // Sync login state with user data
    useEffect(() => {
        setIsLoggedIn(!!user?.token);
    }, [user?.token]);

    // Click outside handler for dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setIsProfileDropdownOpen(false);
            }
            if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target)) {
                setIsLanguageDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
        setIsLanguageDropdownOpen(false);
    };

    // Handle navigation
    const handleNavigation = (path) => {
        navigate(path);
        setIsMobileMenuOpen(false);
        setIsProfileDropdownOpen(false);
    };

    // Handle login/logout
    const handleLogin = () => {
        navigate('/login');
        setIsMobileMenuOpen(false);
    };

    const handleLogout = () => {
        auth.logout();
        // Add your logout logic here
        navigate('/');
        setIsMobileMenuOpen(false);
        setIsProfileDropdownOpen(false);
    };

    const toggleProfileDropdown = () => {
        setIsProfileDropdownOpen(!isProfileDropdownOpen);
        // Close language dropdown when opening profile dropdown
        if (isLanguageDropdownOpen) setIsLanguageDropdownOpen(false);
    };

    const toggleLanguageDropdown = () => {
        setIsLanguageDropdownOpen(!isLanguageDropdownOpen);
        // Close profile dropdown when opening language dropdown
        if (isProfileDropdownOpen) setIsProfileDropdownOpen(false);
    };

    // Function to render logo with name
    const renderLogo = () => {
        return (
            <div className="flex items-center space-x-3">
                <div className="bg-white rounded-full shadow-md flex items-center justify-center">
                    {mainData?.logo_link ? (
                        <img
                            src={mainData.logo_link}
                            alt={mainData?.name || "Logo"}
                            className="h-8 w-8 sm:h-10 sm:w-10 object-contain rounded-full"
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
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-white"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                    />
                ) : null}
                <div
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center border-2 border-white"
                    style={{ display: user?.profile_image ? 'none' : 'flex' }}
                >
                    <User
                        className="h-5 w-5 sm:h-6 sm:w-6"
                        style={{ color: 'var(--color-main)' }}
                    />
                </div>

                {/* Online indicator */}
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
        );
    };

    // Enhanced dropdown component
    const ProfileDropdown = () => (
        <div
            ref={profileDropdownRef}
            className={`absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-60 transition-all duration-200 ${isProfileDropdownOpen ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-2 pointer-events-none'
                }`}
        >
            {/* User info header */}
            <div className="px-4 py-3 border-b border-gray-100">
                <p className="font-semibold text-gray-900 truncate">
                    {user?.name || t('user')}
                </p>
                <p className="text-sm text-gray-500 truncate">
                    {user?.email || 'user@example.com'}
                </p>
            </div>

            <Link
                to="/profile"
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors group"
                onClick={() => handleNavigation('/profile')}
            >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:bg-opacity-20 transition-colors">
                    <User className="h-4 w-4" style={{ color: 'var(--color-main)' }} />
                </div>
                <span className="font-medium">{t('myProfile')}</span>
            </Link>

            <Link
                to="/orders"
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors group"
                onClick={() => handleNavigation('/orders')}
            >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:bg-opacity-20 transition-colors">
                    <Package className="h-4 w-4" style={{ color: 'var(--color-main)' }} />
                </div>
                <span className="font-medium">{t('myOrders')}</span>
            </Link>

            <div className="border-t border-gray-100 mt-2 pt-2">
                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-colors group"
                >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:bg-opacity-20 transition-colors">
                        <LogOut className="h-4 w-4" style={{ color: 'var(--color-main)' }}/>
                    </div>
                    <span className="font-medium">{t('logout')}</span>
                </button>
            </div>
        </div>
    );

    const LanguageDropdown = () => (
        <div
            ref={languageDropdownRef}
            className={`absolute top-full left-0 mt-2 w-32 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-60 transition-all duration-200 ${isLanguageDropdownOpen ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-2 pointer-events-none'
                }`}
        >
            {languages.map((lang) => (
                <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.name)}
                    className={`flex items-center space-x-3 w-full px-3 py-2 text-left transition-colors ${selectedLanguage === lang.name
                        ? 'bg-gray-100'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    style={selectedLanguage === lang.name ? { color: 'var(--color-main)' } : {}}
                >
                    <span className="text-lg">{lang.flag || '🌐'}</span>
                    <span className="flex-1 font-medium">{lang.name}</span>
                </button>
            ))}
        </div>
    );

    return (
        <>
            {pages.some(page => location.pathname === page) ? (
                ''
            ) : (
                <nav className="shadow-lg relative z-40" style={{ backgroundColor: 'var(--color-main)' }}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16 lg:h-20">
                            {/* Logo with Name */}
                            <Link to="/" className="flex-shrink-0 hover:opacity-90 transition-opacity">
                                {renderLogo()}
                            </Link>

                            {/* Desktop Navigation */}
                            <div className="hidden xl:flex xl:items-center xl:space-x-8">
                                {menuItems.map((item, index) => (
                                    <Link
                                        key={index}
                                        to={item.path}
                                        className="text-white hover:text-gray-200 transition-all duration-200 font-medium flex items-center space-x-2 group relative"
                                    >
                                        <item.icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                        <span>{t(item.i18nKey)}</span>
                                    </Link>
                                ))}
                            </div>

                            {/* Desktop Right Side Icons */}
                            <div className="hidden xl:flex xl:items-center lg:space-x-6">
                                {/* Favorites */}
                                {
                                    user && (
                                        <>
                                            <Link
                                                to="/favorite_product"
                                                className="relative p-2 text-white hover:text-gray-200 transition-colors group"
                                            >
                                                <Heart className="h-6 w-6 group-hover:scale-110 transition-transform" />
                                                {/* {favCount > 0 && (
                                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                                        {favCount}
                                                    </span>
                                                )} */}
                                            </Link>

                                            {/* Cart */}
                                            <Link
                                                to="/cart"
                                                className="relative p-2 text-white hover:text-gray-200 transition-colors group"
                                            >
                                                <ShoppingCart className="h-6 w-6 group-hover:scale-110 transition-transform" />
                                                {cartCount > 0 && (
                                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                                        {cartCount}
                                                    </span>
                                                )}
                                            </Link>
                                        </>
                                    )
                                }

                                {/* Language Toggle - Desktop */}
                                <div className="relative" ref={languageDropdownRef}>
                                    <button
                                        onClick={toggleLanguageDropdown}
                                        className="text-white hover:text-gray-200 transition-colors flex items-center space-x-2 bg-white bg-opacity-20 rounded-full px-4 py-2 group"
                                    >
                                        <Globe className="h-4 w-4" />
                                        <span className="font-medium">{currentLanguageName}</span>
                                    </button>
                                    <LanguageDropdown />
                                </div>

                                {/* Profile/Login */}
                                {isLoggedIn ? (
                                    <div className="relative" ref={profileDropdownRef}>
                                        <button
                                            onClick={toggleProfileDropdown}
                                            className="flex items-center space-x-3 text-white hover:text-gray-200 transition-colors group p-1 rounded-lg"
                                        >
                                            {renderUserProfile()}
                                            <span className="font-medium hidden lg:block">
                                                {user?.name || t('profile')}
                                            </span>
                                            <div className={`transform transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`}>
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </button>
                                        <ProfileDropdown />
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleLogin}
                                        className="text-white px-6 py-2 rounded-full font-medium bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200 border border-white border-opacity-30"
                                        style={{ color: 'var(--color-main)' }}
                                    >
                                        <span style={{ color: 'white' }}>{t('login')}</span>
                                    </button>
                                )}
                            </div>

                            {/* Mobile Menu Button Area */}
                            <div className="xl:hidden flex items-center space-x-4">
                                {/* Cart Icon */}
                                {user && (
                                    <Link to="/cart" className="text-white relative p-2">
                                        <ShoppingCart className="h-5 w-5" />
                                        {cartCount > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                                                {cartCount}
                                            </span>
                                        )}
                                    </Link>
                                )}

                                <div className="relative" ref={languageDropdownRef}>
                                    <button
                                        onClick={toggleLanguageDropdown}
                                        className="text-white hover:text-gray-200 transition-colors flex items-center space-x-2 bg-white bg-opacity-20 rounded-full px-4 py-2 group"
                                    >
                                        <Globe className="h-4 w-4" />
                                        <span className="font-medium">{currentLanguageName}</span>
                                    </button>
                                    <LanguageDropdown />
                                </div>

                                {/* Mobile Menu Button */}
                                <button
                                    onClick={toggleMobileMenu}
                                    className="text-white hover:text-gray-200 transition-colors p-2 rounded-lg bg-white bg-opacity-10"
                                >
                                    {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>
            )}

            {/* Enhanced Mobile Sidebar - Starts after navbar */}
            {pages.some(page => location.pathname === page) ? (
                ''
            ) : (
                <div className={`fixed inset-0 z-50 xl:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`} style={{ top: '4rem' }}> {/* Adjusted to start after navbar */}

                    {/* Backdrop */}
                    <div
                        className={`absolute inset-0 bg-black transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-50' : 'opacity-0'
                            }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    {/* Sidebar */}
                    <div className={`absolute top-0 left-0 h-full w-80 max-w-full bg-white shadow-2xl transform transition-transform duration-300 ease-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}>
                        <div className="flex flex-col h-full">
                            {/* Scrollable Content - Starts immediately without header */}
                            <div className="flex-1 overflow-y-auto scrollPage">
                                {/* Profile Section */}
                                <div className="p-6 border-b border-gray-100">
                                    {isLoggedIn ? (
                                        <div className="flex items-center">
                                            {renderUserProfile()}
                                            <button onClick={() => navigate('/profile')} className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-900 truncate">
                                                    {user?.name || t('user')}
                                                </p>
                                                <p className="text-gray-600 text-sm truncate">
                                                    {user?.email || t('manageAccount')}
                                                </p>
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleLogin}
                                            className="w-full text-white py-3 rounded-lg font-medium hover:opacity-90 transition-all duration-200 shadow-lg"
                                            style={{ backgroundColor: 'var(--color-main)' }}
                                        >
                                            {t('loginSignUp')}
                                        </button>
                                    )}
                                </div>

                                {/* Menu Items */}
                                <div className="p-4 space-y-2">
                                    {menuItems.map((item, index) => (
                                        <Link
                                            key={index}
                                            to={item.path}
                                            className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <div className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:bg-opacity-20 transition-colors">
                                                <item.icon className="h-6 w-6" style={{ color: 'var(--color-main)' }} />
                                            </div>
                                            <span className="text-gray-800 font-medium text-lg">
                                                {t(item.i18nKey)}
                                            </span>
                                        </Link>
                                    ))}

                                    {/* Favorites */}
                                    {isLoggedIn && user && (
                                        <>
                                            <Link
                                                to="/favorite_product"
                                                className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group relative"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <div className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:bg-opacity-20 transition-colors">
                                                    <Heart className="h-6 w-6" style={{ color: 'var(--color-main)' }} />
                                                </div>
                                                <span className="text-gray-800 font-medium text-lg">
                                                    {t('favorites')}
                                                </span>
                                                {/* {favCount > 0 && (
                                                    <span className="absolute right-4 bg-red-500 text-white text-sm rounded-full h-6 w-6 flex items-center justify-center font-bold">
                                                        {favCount}
                                                    </span>
                                                )} */}
                                            </Link>

                                             <Link
                                                to="/orders"
                                                className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group relative"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <div className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:bg-opacity-20 transition-colors">
                                                    <Package className="h-6 w-6" style={{ color: 'var(--color-main)' }} />
                                                </div>
                                                <span className="text-gray-800 font-medium text-lg">
                                                    {t('Orders')}
                                                </span>
                                            </Link>

                                            {/* Logout in Sidebar for logged-in users */}
                                            <button
                                                onClick={() => {
                                                    handleLogout();
                                                    setIsMobileMenuOpen(false);
                                                }}
                                                className="flex items-center space-x-4 p-3 rounded-xl hover:bg-red-50 transition-all duration-200 group w-full text-left"
                                            >
                                                <div className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:bg-opacity-20 transition-colors">
                                                    <LogOut className="h-6 w-6 text-red-600" />
                                                </div>
                                                <span className="text-red-600 font-medium text-lg">
                                                    {t('logout')}
                                                </span>
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* Language Selector */}
                                {/* <div className="p-6 border-t border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-gray-700 font-medium">{t('language')}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {languages.map((lang) => (
                                            <button
                                                key={lang.code}
                                                onClick={() => {
                                                    handleLanguageChange(lang.code);
                                                    setIsMobileMenuOpen(false);
                                                }}
                                                className={`p-3 rounded-lg border transition-all duration-200 ${selectedLanguage === lang.code
                                                    ? 'border-gray-300 bg-gray-100'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                style={selectedLanguage === lang.code ? { color: 'var(--color-main)', borderColor: 'var(--color-main)' } : {}}
                                            >
                                                <div className="flex items-center space-x-2 justify-center">
                                                    <span className="text-lg">{lang.flag}</span>
                                                    <span className="font-medium">{lang.name}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div> */}
                            </div>

                            {/* Footer */}
                            <div className="p-2 border-t border-gray-100 bg-gray-50">
                                <div className="flex items-center justify-center space-x-3 text-gray-600">
                                    <Link to="https://food2go.online/" target="_blank" className="flex items-center justify-center gap-2">
                                        <h1 className="text-gray-600">{t("Poweredby")}</h1>
                                        <img src={mainLogo} className="w-16 h-16" alt="Main Logo" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;