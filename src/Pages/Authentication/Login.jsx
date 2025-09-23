import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePost } from '../../Hooks/usePost';
import { useGet } from '../../Hooks/useGet';
import { FaEnvelope, FaPhone, FaLock, FaUser, FaGoogle, FaFacebook, FaUtensils, FaArrowLeft } from 'react-icons/fa';
import { RiCustomerService2Fill } from 'react-icons/ri';
import { MdEmail, MdOutlinePassword, MdFastfood } from 'react-icons/md';
import { BiSolidFoodMenu } from 'react-icons/bi';
import { TbPasswordUser } from 'react-icons/tb';
import { useAuth } from '../../Context/Auth';

const LoginPage = () => {
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const auth = useAuth();

    // State management
    const [verificationMethod, setVerificationMethod] = useState(null);
    const [loginStep, setLoginStep] = useState('login');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    // API hooks
    const { refetch: fetchVerificationType, loading: loadingVerification, data: verificationData } = useGet({
        url: `${apiUrl}/api/customer_login`
    });

    const { postData: postSendOtp, loadingPost: loadingSendOtp, response: responseSendOtp } = usePost({
        url: `${apiUrl}/customer/otp/create_code`
    });

    const { postData: postVerifyOtp, loadingPost: loadingVerifyOtp, response: responseVerifyOtp } = usePost({
        url: `${apiUrl}/customer/otp/check_code`
    });

    const { postData: postResetPassword, loadingPost: loadingResetPassword, response: responseResetPassword } = usePost({
        url: `${apiUrl}/customer/otp/change_password`
    });

    const { postData: postLogin, loadingPost: loadingLogin, response: responseLogin } = usePost({
        url: `${apiUrl}/api/user/auth/login`
    });

    // Fetch verification method on component mount
    useEffect(() => {
        fetchVerificationType();
    }, [fetchVerificationType]);

    // Set verification method when data is available
    useEffect(() => {
        if (verificationData && verificationData.customer_login) {
            setVerificationMethod(verificationData.customer_login?.verification);
            setLoginStep('login');
        }
    }, [verificationData]);

    useEffect(() => {
        if (responseLogin && responseLogin?.status === 200) {
            navigate('/');
            auth.login(responseLogin.data);
        }
    }, [responseLogin, loadingLogin])

    useEffect(() => {
        if (responseSendOtp?.status === 200) {
            setLoginStep('otp');
            setSuccessMessage(`Verification code sent to your ${verificationMethod}`);
        }
    }, [responseSendOtp, loadingSendOtp])

    useEffect(() => {
        if (responseVerifyOtp?.status === 200) {
            setLoginStep('newPassword');
            setSuccessMessage('Code verified successfully. Please set your new password.');
        }
    }, [responseVerifyOtp, loadingVerifyOtp])

    useEffect(() => {
        if (responseVerifyOtp?.status === 200) {
            setLoginStep('newPassword');
            setSuccessMessage('Code verified successfully. Please set your new password.');
        }
    }, [responseVerifyOtp, loadingVerifyOtp])

    useEffect(() => {
        if (responseResetPassword && responseResetPassword?.status === 200 && !loadingResetPassword) {
            setSuccessMessage('Password reset successfully. You can now login with your new password.');
            setTimeout(() => {
                setLoginStep('login');
                setNewPassword('');
                setConfirmPassword('');
                setOtp('');
            }, 2000);
        }
    }, [responseResetPassword, loadingResetPassword])

    // Validate email format
    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    // Validate phone number format
    const validatePhone = (phone) => {
        const re = /^[+]?[0-9]{10,15}$/;
        return re.test(phone);
    };

    // Handle login form submission
    const handleLogin = async (e) => {
        e.preventDefault();

        setErrors({});

        // Validation
        const newErrors = {};
        if (!validateEmail(email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        if (!password) {
            newErrors.password = 'Password is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);

            return;
        }
        const credentials = {
            email,
            password
        };

        postLogin(credentials);
    };

    // Handle forgot password
    const handleForgotPassword = async (e) => {
        e.preventDefault();

        setErrors({});

        // Validation
        const newErrors = {};
        if (verificationMethod === 'email' && !validateEmail(email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        if (verificationMethod === 'phone' && !validatePhone(phone)) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);

            return;
        }

        const payload = {
            [verificationMethod]: verificationMethod === 'email' ? email : phone
        };

        postSendOtp(payload);

    };

    // Handle OTP verification
    const handleVerifyOtp = async (e) => {
        e.preventDefault();

        setErrors({});

        if (!otp) {
            setErrors({ otp: 'Please enter a valid 5-digit code' });

            return;
        }
        const payload = {
            email: verificationMethod === 'email' ? email : phone,
            code: otp
        };

        postVerifyOtp(payload);
    };

    // Handle password reset
    const handleResetPassword = async (e) => {
        e.preventDefault();

        setErrors({});

        // Validation
        const newErrors = {};
        if (!newPassword) {
            newErrors.newPassword = 'New password is required';
        } else if (newPassword.length < 6) {
            newErrors.newPassword = 'Password must be at least 6 characters';
        }

        if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        const payload = {
            [verificationMethod]: verificationMethod === 'email' ? email : phone,
            password: newPassword
        };

        postResetPassword(payload);
    };

    // Render appropriate content based on login step
    const renderContent = () => {
        switch (loginStep) {
            case 'login':
                return (
                    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-amber-100 p-4">
                        <div className="relative max-w-4xl w-full flex rounded-3xl overflow-hidden shadow-2xl">
                            {/* Left side - Illustration */}
                            <div className="hidden md:flex md:w-2/5 bg-red-500 flex-col justify-center items-center p-8 text-white relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-b from-red-500/20 to-red-700/30"></div>
                                <div className="relative z-10 text-center">
                                    <div className="mb-6 flex justify-center">
                                        <MdFastfood className="w-24 h-24 text-white" />
                                    </div>
                                    <h2 className="text-3xl font-bold mb-4">Food2Go</h2>
                                    <p className="text-red-100">Delicious meals delivered to your door</p>
                                </div>

                                {/* Decorative elements */}
                                <div className="absolute top-10 left-10 w-16 h-16 rounded-full bg-white/10"></div>
                                <div className="absolute bottom-10 right-10 w-20 h-20 rounded-full bg-white/10"></div>
                                <div className="absolute top-1/3 right-6 w-10 h-10 rounded-full bg-white/5"></div>
                            </div>

                            {/* Right side - Form */}
                            <div className="w-full md:w-3/5 bg-white p-8 md:p-12 flex flex-col justify-center">
                                <div className="text-center mb-8">
                                    <h1 className="text-3xl font-bold text-red-800 mb-2">Welcome Back</h1>
                                    <p className="text-red-600">Sign in to continue to Food2Go</p>
                                </div>

                                <form onSubmit={handleLogin} className="space-y-5">
                                    <div>
                                        <label className="block text-gray-700 text-sm font-medium mb-2">Email Address</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FaEnvelope className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Enter your email"
                                                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-red-200 focus:border-red-500 outline-none transition duration-200`}
                                            />
                                        </div>
                                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FaLock className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Enter your password"
                                                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-red-200 focus:border-red-500 outline-none transition duration-200`}
                                            />
                                        </div>
                                        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                                    </div>

                                    <div className="flex justify-between items-center">

                                        <button
                                            type="button"
                                            className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
                                            onClick={() => setLoginStep('forgot')}
                                        >
                                            Forgot Password?
                                        </button>
                                    </div>

                                    {errors.general && (
                                        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                                            {errors.general}
                                        </div>
                                    )}

                                    {successMessage && (
                                        <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                                            {successMessage}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center shadow-md hover:shadow-lg"
                                        disabled={loadingLogin}
                                    >
                                        {loadingLogin ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Logging in...
                                            </>
                                        ) : 'Login'}
                                    </button>
                                </form>

                                <div className="mt-8 text-center">
                                    <p className="text-sm text-gray-600">
                                        Don't have an account?{' '}
                                        <button type="button" className="text-red-600 hover:text-red-800 font-medium">
                                            Sign up
                                        </button>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'forgot':
                return (
                    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-amber-100 p-4">
                        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
                            <button
                                onClick={() => setLoginStep('login')}
                                className="flex items-center text-red-600 hover:text-red-800 mb-6"
                            >
                                <FaArrowLeft className="mr-2" /> Back to Login
                            </button>

                            <div className="text-center mb-8">
                                <div className="flex justify-center mb-4">
                                    <TbPasswordUser className="w-12 h-12 text-red-500" />
                                </div>
                                <h1 className="text-2xl font-bold text-red-800 mb-2">Reset Password</h1>
                                <p className="text-red-600">Enter your {verificationMethod} to receive a verification code</p>
                            </div>

                            <form onSubmit={handleForgotPassword}>
                                {verificationMethod === 'email' ? (
                                    <div className="mb-6">
                                        <label className="block text-gray-700 text-sm font-medium mb-2">Email Address</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FaEnvelope className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Enter your email"
                                                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-red-200 focus:border-red-500 outline-none transition duration-200`}
                                            />
                                        </div>
                                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                                    </div>
                                ) : (
                                    <div className="mb-6">
                                        <label className="block text-gray-700 text-sm font-medium mb-2">Phone Number</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FaPhone className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="Enter your phone number"
                                                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.phone ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-red-200 focus:border-red-500 outline-none transition duration-200`}
                                            />
                                        </div>
                                        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                                    </div>
                                )}

                                {errors.general && (
                                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                                        {errors.general}
                                    </div>
                                )}

                                {successMessage && (
                                    <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                                        {successMessage}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center shadow-md"
                                    disabled={loadingSendOtp}
                                >
                                    {loadingSendOtp ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Sending...
                                        </>
                                    ) : 'Send Verification Code'}
                                </button>
                            </form>
                        </div>
                    </div>
                );

            case 'otp':
                return (
                    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-amber-100 p-4">
                        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
                            <button
                                onClick={() => setLoginStep('forgot')}
                                className="flex items-center text-red-600 hover:text-red-800 mb-6"
                            >
                                <FaArrowLeft className="mr-2" /> Back
                            </button>

                            <div className="text-center mb-8">
                                <div className="flex justify-center mb-4">
                                    <MdEmail className="w-12 h-12 text-red-500" />
                                </div>
                                <h1 className="text-2xl font-bold text-red-800 mb-2">Verification Code</h1>
                                <p className="text-red-600">We've sent a 6-digit code to your {verificationMethod}</p>
                            </div>

                            <form onSubmit={handleVerifyOtp}>
                                <div className="mb-6">
                                    <label className="block text-gray-700 text-sm font-medium mb-2">Verification Code</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <RiCustomerService2Fill className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 5))}
                                            placeholder="Enter 5-digit code"
                                            className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.otp ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-red-200 focus:border-red-500 outline-none transition duration-200 text-center text-xl tracking-widest`}
                                            maxLength={5}
                                        />
                                    </div>
                                    {errors.otp && <p className="mt-1 text-sm text-red-600">{errors.otp}</p>}
                                </div>

                                {errors.general && (
                                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                                        {errors.general}
                                    </div>
                                )}

                                {successMessage && (
                                    <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                                        {successMessage}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center shadow-md"
                                    disabled={loadingVerifyOtp}
                                >
                                    {loadingVerifyOtp ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Verifying...
                                        </>
                                    ) : 'Verify Code'}
                                </button>

                                <div className="mt-6 text-center">
                                    <p className="text-sm text-gray-600">
                                        Didn't receive the code?{' '}
                                        <button type="button" className="text-red-600 hover:text-red-800 font-medium">
                                            Resend
                                        </button>
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                );

            case 'newPassword':
                return (
                    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-amber-100 p-4">
                        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
                            <button
                                onClick={() => setLoginStep('otp')}
                                className="flex items-center text-red-600 hover:text-red-800 mb-6"
                            >
                                <FaArrowLeft className="mr-2" /> Back
                            </button>

                            <div className="text-center mb-8">
                                <div className="flex justify-center mb-4">
                                    <MdOutlinePassword className="w-12 h-12 text-red-500" />
                                </div>
                                <h1 className="text-2xl font-bold text-red-800 mb-2">Set New Password</h1>
                                <p className="text-red-600">Please enter your new password</p>
                            </div>

                            <form onSubmit={handleResetPassword}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-medium mb-2">New Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaLock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Enter new password"
                                            className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.newPassword ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-red-200 focus:border-red-500 outline-none transition duration-200`}
                                        />
                                    </div>
                                    {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
                                </div>

                                <div className="mb-6">
                                    <label className="block text-gray-700 text-sm font-medium mb-2">Confirm New Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaLock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm new password"
                                            className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-red-200 focus:border-red-500 outline-none transition duration-200`}
                                        />
                                    </div>
                                    {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                                </div>

                                {errors.general && (
                                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                                        {errors.general}
                                    </div>
                                )}

                                {successMessage && (
                                    <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                                        {successMessage}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center shadow-md"
                                    disabled={loadingResetPassword}
                                >
                                    {loadingResetPassword ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Resetting...
                                        </>
                                    ) : 'Reset Password'}
                                </button>
                            </form>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="login-page">
            {renderContent()}
        </div>
    );
};

export default LoginPage;