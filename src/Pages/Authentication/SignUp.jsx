import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaEnvelope, FaPhone, FaLock, FaUser, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../../Context/Auth';
import { usePost } from '../../Hooks/usePost';
import { InputOtp } from 'primereact/inputotp';
import { MdFastfood } from 'react-icons/md';
import { useGet } from '../../Hooks/useGet';

const SignUpPage = () => {
    const auth = useAuth();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const mainData = useSelector((state) => state.mainData?.data);
    const selectedLanguage = useSelector((state) => state.language?.selected ?? 'en');
    // API hooks
    const { refetch: fetchVerificationType, loading: loadingVerification, data: verificationData } = useGet({
        url: `${apiUrl}/api/customer_login`
    });

    const [code, setCode] = useState('');

    const [signState, setSignState] = useState('signUp');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [optionalPhone, setOptionalPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [configPassword, setConfigPassword] = useState('');
    const [token, setToken] = useState('');
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [verificationMethod, setVerificationMethod] = useState(null);

    const { postData: postEmail, loadingPost: loadingEmail, response: responseEmail } = usePost({
        url: `${apiUrl}/api/user/auth/signup/code`,
    });
    const { postData: postPhone, loadingPost: loadingPhone, response: responsePhone } = usePost({
        url: `${apiUrl}/api/user/auth/signup/phone_code`,
    });
    const { postData: postSignUp, loadingPost: loadingSignUp, response: responseSignUp } = usePost({
        url: `${apiUrl}/api/user/auth/signup`,
    });

    const customInput = ({ events, props }) => {
        const { invalid, ...inputProps } = props;
        const inputClass = invalid ? 'border-secoundColor' : 'border-gray-300';

        return (
            <input
                {...events}
                {...inputProps}
                key={props.id}
                className={`w-full pl-4 pr-4 py-3 rounded-lg text-black border ${inputClass} focus:ring-2 focus:ring-thirdColor focus:border-mainColor outline-none transition duration-200 text-center text-xl tracking-widest`}
                type="text"
                unstyled={props.unstyled ? 'true' : 'false'}
            />
        );
    };

    // Fetch verification method on component mount
    useEffect(() => {
        fetchVerificationType();
    }, [fetchVerificationType]);

    // Set verification method when data is available
    useEffect(() => {
        if (verificationData && verificationData.customer_login) {
            setVerificationMethod(verificationData.customer_login?.verification);
        }
    }, [verificationData]);

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const validatePhone = (phone) => {
        const re = /^[+]?[0-9]{10,15}$/;
        return re.test(phone);
    };

    const handleSignUp = (e) => {
        e.preventDefault();
        setErrors({});
        setSuccessMessage('');

        const newErrors = {};
        if (!firstName) newErrors.firstName = 'Please enter your first name';
        if (!lastName) newErrors.lastName = 'Please enter your last name';
        if (!validatePhone(phone)) newErrors.phone = 'Please enter a valid phone number';
        if (!validateEmail(email)) newErrors.email = 'Please enter a valid email address';
        if (!password)

 newErrors.password = 'Please enter a password';
        if (configPassword !== password) newErrors.configPassword = 'Passwords do not match';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const payload = {
            f_name: firstName,
            l_name: lastName,
            phone,
            phone_2: optionalPhone,
            email,
            password,
            conf_password: configPassword,
        };

        if (token) {
            Number(token) === code ? postSignUp(payload) : setErrors({ token: 'Invalid OTP code' });
        } else {
            if (verificationMethod === 'email') {
                postEmail({ email: payload.email });
            }
            if (verificationMethod === 'phone') {
                postPhone({ phone: payload.phone });
            }
        }
    };

    useEffect(() => {
        if (responseSignUp) {
            auth.login(responseSignUp.data);
            navigate('/order_online', { replace: true });
        }
    }, [responseSignUp]);

    useEffect(() => {
        if (responseEmail) {
            setSignState('otp');
            setSuccessMessage(`Verification code sent to your email`);
            setCode(responseEmail?.data?.code);
        }
    }, [responseEmail]);

    useEffect(() => {
        if (responsePhone) {
            setSignState('otp');
            setSuccessMessage(`Verification code sent to your phone`);
            setCode(responsePhone?.data?.code);
        }
    }, [responsePhone]);

    const renderContent = () => {
        if (loadingSignUp || loadingEmail || loadingPhone) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-thirdColor to-mainColor p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                        <svg
                            className="animate-spin h-10 w-10 text-mainColor mx-auto"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                        <p className="mt-4 text-secoundColor">Processing...</p>
                    </div>
                </div>
            );
        }

        switch (signState) {
            case 'signUp':
                return (
                    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-thirdColor to-mainColor p-4">
                        <div className="relative max-w-6xl w-full flex rounded-3xl overflow-hidden shadow-2xl">
                            {/* Left side - Illustration */}
                            <div className="hidden md:flex md:w-2/5 bg-mainColor flex-col justify-center items-center p-8 text-white relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-b from-mainColor/20 to-secoundColor/30"></div>
                                <div className="relative z-10 text-center">
                                    <div className="mb-6 flex justify-center">
                                        <MdFastfood className="w-24 h-24 text-white" />
                                    </div>
                                    <h2 className="text-3xl font-bold mb-4">{`${selectedLanguage === "en" ? mainData?.name : mainData?.ar_name}`}</h2>
                                    <p className="text-thirdColor">Delicious meals delivered to your door</p>
                                </div>
                                <div className="absolute top-10 left-10 w-16 h-16 rounded-full bg-white/10"></div>
                                <div className="absolute bottom-10 right-10 w-20 h-20 rounded-full bg-white/10"></div>
                                <div className="absolute top-1/3 right-6 w-10 h-10 rounded-full bg-white/5"></div>
                            </div>

                            {/* Right side - Form */}
                            <div className="w-full md:w-3/5 bg-white p-8 md:p-12 flex flex-col justify-center">
                                <div className="text-center mb-8">
                                    <h1 className="text-3xl font-bold text-secoundColor mb-2">
                                        Sign Up to {selectedLanguage === 'en' ? mainData?.name : mainData?.ar_name}
                                    </h1>
                                    <p className="text-secoundColor">Create your {`${selectedLanguage === "en" ? mainData?.name : mainData?.ar_name}`} account</p>
                                </div>

                                <form onSubmit={handleSignUp} className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-gray-700 text-sm font-medium mb-2">First Name</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <FaUser className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={firstName}
                                                    onChange={(e) => setFirstName(e.target.value)}
                                                    placeholder="Enter your first name"
                                                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.firstName ? 'border-secoundColor' : 'border-gray-300'} focus:ring-2 focus:ring-thirdColor focus:border-mainColor outline-none transition duration-200`}
                                                />
                                            </div>
                                            {errors.firstName && <p className="mt-1 text-sm text-secoundColor">{errors.firstName}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 text-sm font-medium mb-2">Last Name</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <FaUser className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={lastName}
                                                    onChange={(e) => setLastName(e.target.value)}
                                                    placeholder="Enter your last name"
                                                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.lastName ? 'border-secoundColor' : 'border-gray-300'} focus:ring-2 focus:ring-thirdColor focus:border-mainColor outline-none transition duration-200`}
                                                />
                                            </div>
                                            {errors.lastName && <p className="mt-1 text-sm text-secoundColor">{errors.lastName}</p>}
                                        </div>
                                    </div>

                                    <div>
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
                                                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.phone ? 'border-secoundColor' : 'border-gray-300'} focus:ring-2 focus:ring-thirdColor focus:border-mainColor outline-none transition duration-200`}
                                            />
                                        </div>
                                        {errors.phone && <p className="mt-1 text-sm text-secoundColor">{errors.phone}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 text-sm font-medium mb-2">Optional Phone Number</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FaPhone className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="tel"
                                                value={optionalPhone}
                                                onChange={(e) => setOptionalPhone(e.target.value)}
                                                placeholder="Enter optional phone number"
                                                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.optionalPhone ? 'border-secoundColor' : 'border-gray-300'} focus:ring-2 focus:ring-thirdColor focus:border-mainColor outline-none transition duration-200`}
                                            />
                                        </div>
                                    </div>

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
                                                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.email ? 'border-secoundColor' : 'border-gray-300'} focus:ring-2 focus:ring-thirdColor focus:border-mainColor outline-none transition duration-200`}
                                            />
                                        </div>
                                        {errors.email && <p className="mt-1 text-sm text-secoundColor">{errors.email}</p>}
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
                                                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.password ? 'border-secoundColor' : 'border-gray-300'} focus:ring-2 focus:ring-thirdColor focus:border-mainColor outline-none transition duration-200`}
                                            />
                                        </div>
                                        {errors.password && <p className="mt-1 text-sm text-secoundColor">{errors.password}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 text-sm font-medium mb-2">Confirm Password</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FaLock className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="password"
                                                value={configPassword}
                                                onChange={(e) => setConfigPassword(e.target.value)}
                                                placeholder="Confirm your password"
                                                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.configPassword ? 'border-secoundColor' : 'border-gray-300'} focus:ring-2 focus:ring-thirdColor focus:border-mainColor outline-none transition duration-200`}
                                            />
                                        </div>
                                        {errors.configPassword && <p className="mt-1 text-sm text-secoundColor">{errors.configPassword}</p>}
                                    </div>

                                    {errors.general && (
                                        <div className="p-3 bg-thirdColor text-secoundColor rounded-lg text-sm">{errors.general}</div>
                                    )}
                                    {successMessage && (
                                        <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">{successMessage}</div>
                                    )}

                                    <button
                                        type="submit"
                                        className="w-full bg-mainColor hover:bg-secoundColor text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center shadow-md hover:shadow-lg"
                                        disabled={loadingSignUp}
                                    >
                                        {loadingSignUp ? (
                                            <>
                                                <svg
                                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                                Signing Up...
                                            </>
                                        ) : 'Sign Up'}
                                    </button>
                                </form>

                                <div className="mt-8 text-center">
                                    <p className="text-sm text-gray-600">
                                        Already have an account?{' '}
                                        <Link to="/login" className="text-secoundColor hover:text-mainColor font-medium">
                                            Log In
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'otp':
                return (
                    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-thirdColor to-mainColor p-4">
                        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-8 max-w-md w-full">
                            <button
                                onClick={() => setSignState('signUp')}
                                className="flex items-center text-secoundColor hover:text-mainColor mb-6"
                            >
                                <FaArrowLeft className="mr-2" /> Back to Sign Up
                            </button>

                            <div className="text-center mb-8">
                                <div className="flex justify-center mb-4">
                                    <FaEnvelope className="w-12 h-12 text-mainColor" />
                                </div>
                                <h1 className="text-2xl font-bold text-secoundColor mb-2">Verification Code</h1>
                                <p className="text-secoundColor">
                                    We've sent a 5-digit code to your {verificationMethod === 'email' ? 'email' : 'phone'}
                                </p>
                            </div>

                            <form onSubmit={handleSignUp}>
                                <div className="mb-6">
                                    <label className="block text-gray-700 text-sm font-medium mb-2">Verification Code</label>
                                    <div className="relative">
                                        <InputOtp
                                            value={token}
                                            onChange={(e) => setToken(e.value)}
                                            length={5}
                                            integerOnly
                                            inputTemplate={customInput}
                                        />
                                    </div>
                                    {errors.token && <p className="mt-1 text-sm text-secoundColor">{errors.token}</p>}
                                </div>

                                {errors.general && (
                                    <div className="mb-4 p-3 bg-thirdColor text-secoundColor rounded-lg text-sm">{errors.general}</div>
                                )}
                                {successMessage && (
                                    <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">{successMessage}</div>
                                )}

                                <button
                                    type="submit"
                                    className="w-full bg-mainColor hover:bg-secoundColor text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center shadow-md"
                                    disabled={loadingSignUp}
                                >
                                    {loadingSignUp ? (
                                        <>
                                            <svg
                                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            Verifying...
                                        </>
                                    ) : 'Verify Code'}
                                </button>
                            </form>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return <div className="signup-page">{renderContent()}</div>;
};

export default SignUpPage;