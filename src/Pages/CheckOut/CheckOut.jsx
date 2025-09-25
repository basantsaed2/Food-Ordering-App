import React, { useState, useEffect, useRef } from "react";
import { useGet } from '../../Hooks/useGet';
import { usePost } from '../../Hooks/usePost';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import StaticSpinner from "../../Components/Spinners/StaticSpinner";
import {
    Clock,
    CreditCard,
    FileText,
    Calendar,
    Truck,
    Store,
    Shield,
    CheckCircle,
    AlertCircle,
    Receipt,
    MapPin,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

const CheckOut = () => {
    const { t } = useTranslation();
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const navigate = useNavigate();
    const cart = useSelector(state => state.cart);

    // Get IDs from orderType slice
    const orderType = useSelector(state => state.orderType?.orderType);
    const selectedAddressId = useSelector(state => state.orderType?.selectedAddressId);
    const selectedBranchId = useSelector(state => state.orderType?.selectedBranchId);

    // Fetch addresses and branches to get full objects
    const { data: addressesData } = useGet({
        url: `${apiUrl}/customer/address?locale=ar`,
        autoFetch: true
    });

    const { data: branchesData } = useGet({
        url: `${apiUrl}/customer/order_type?locale=ar`,
        autoFetch: true
    });

    // Find the actual objects using the stored IDs
    const selectedAddress = addressesData?.addresses?.find(addr => addr.id === selectedAddressId);
    const selectedBranch = branchesData?.branches?.find(branch => branch.id === selectedBranchId);

    const { refetch: refetchSchedule, loading: loadingSchedule, data: dataSchedule } = useGet({
        url: `${apiUrl}/customer/home/schedule_list`,
    });

    const { refetch: refetchPaymentMethod, loading: loadingPaymentMethod, data: dataPaymentMethod } = useGet({
        url: `${apiUrl}/customer/order_type`,
    });

    const { postData: postOrder, loadingPost: loadingOrder, response: responseOrder } = usePost({
        url: `${apiUrl}/customer/make_order?locale=ar`,
        type: true,
    });

    const [scheduleList, setScheduleList] = useState([]);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
    const [notes, setNotes] = useState("");
    const [receiptFile, setReceiptFile] = useState(null);
    const [receiptFileName, setReceiptFileName] = useState("");
    const [showProcessingModal, setShowProcessingModal] = useState(false);
    const [pendingOrderData, setPendingOrderData] = useState(null);
    const [orderSummary, setOrderSummary] = useState({
        subtotal: 0,
        discount: 0,
        tax: 0,
        delivery: 0,
        total: 0
    });

    // State for custom dropdowns
    const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);
    const [showScheduleDropdown, setShowScheduleDropdown] = useState(false);

    const receiptRef = useRef(null);
    const paymentDropdownRef = useRef(null);
    const scheduleDropdownRef = useRef(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (paymentDropdownRef.current && !paymentDropdownRef.current.contains(event.target)) {
                setShowPaymentDropdown(false);
            }
            if (scheduleDropdownRef.current && !scheduleDropdownRef.current.contains(event.target)) {
                setShowScheduleDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        refetchSchedule();
        refetchPaymentMethod();
    }, [refetchSchedule, refetchPaymentMethod]);

    useEffect(() => {
        if (dataPaymentMethod && dataPaymentMethod.payment_methods) {
            setPaymentMethods(dataPaymentMethod.payment_methods);

            // Set default payment method
            const cashMethod = dataPaymentMethod.payment_methods.find(m =>
                m.name.toLowerCase() === 'cash'
            );
            setSelectedPaymentMethod(cashMethod || dataPaymentMethod.payment_methods[0]);
        }
    }, [dataPaymentMethod]);

    useEffect(() => {
        if (dataSchedule?.schedule_list) {
            setScheduleList(dataSchedule.schedule_list);

            // Set default schedule
            const asapOption = dataSchedule.schedule_list.find(item =>
                item.name.toLowerCase().includes('asap') || item.name.toLowerCase().includes('now')
            ) || dataSchedule.schedule_list[0];
            setSelectedSchedule(asapOption);
        }
    }, [dataSchedule]);

    useEffect(() => {
        // Calculate order summary from cart
        if (cart.items.length > 0) {
            const deliveryPrice = orderType === 'delivery' ? (selectedAddress?.zone?.price || 0) : 0;
            setOrderSummary({
                subtotal: cart.subtotal,
                discount: cart.totalDiscount,
                tax: cart.totalTax,
                delivery: deliveryPrice,
                total: cart.total + deliveryPrice
            });
        }
    }, [cart, orderType, selectedAddress]);

    // Custom Payment Method Select Component
    const PaymentMethodSelect = () => (
        <div className="relative" ref={paymentDropdownRef}>
            <button
                type="button"
                onClick={() => setShowPaymentDropdown(!showPaymentDropdown)}
                className="w-full p-4 border border-gray-300 rounded-xl bg-white flex items-center justify-between hover:border-mainColor transition-colors"
            >
                <div className="flex items-center space-x-3">
                    {selectedPaymentMethod ? (
                        <>
                            <img
                                src={selectedPaymentMethod.logo_link}
                                alt={selectedPaymentMethod.name}
                                className="w-8 h-8 object-contain"
                            />
                            <span className="font-medium text-gray-900">
                                {selectedPaymentMethod.name}
                            </span>
                        </>
                    ) : (
                        <span className="text-gray-500">{t('selectPaymentMethod')}</span>
                    )}
                </div>
                {showPaymentDropdown ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
            </button>

            {showPaymentDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-auto">
                    {paymentMethods.map((method) => (
                        <button
                            key={method.id}
                            type="button"
                            onClick={() => {
                                setSelectedPaymentMethod(method);
                                setShowPaymentDropdown(false);
                            }}
                            className={`w-full p-3 flex items-center space-x-3 hover:bg-gray-50 transition-colors ${selectedPaymentMethod?.id === method.id ? 'bg-blue-50' : ''
                                }`}
                        >
                            <img
                                src={method.logo_link}
                                alt={method.name}
                                className="w-6 h-6 object-contain"
                            />
                            <span className="font-medium text-gray-900">{method.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );

    // Custom Schedule Select Component
    const ScheduleSelect = () => (
        <div className="relative" ref={scheduleDropdownRef}>
            <button
                type="button"
                onClick={() => setShowScheduleDropdown(!showScheduleDropdown)}
                className="w-full p-4 border border-gray-300 rounded-xl bg-white flex items-center justify-between hover:border-mainColor transition-colors"
            >
                <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <span className="font-medium text-gray-900">
                        {selectedSchedule ? selectedSchedule.name : t('selectScheduleTime')}
                    </span>
                </div>
                {showScheduleDropdown ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
            </button>

            {showScheduleDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-auto">
                    {scheduleList.map((schedule) => (
                        <button
                            key={schedule.id}
                            type="button"
                            onClick={() => {
                                setSelectedSchedule(schedule);
                                setShowScheduleDropdown(false);
                            }}
                            className={`w-full p-3 text-left hover:bg-gray-50 transition-colors ${selectedSchedule?.id === schedule.id ? 'bg-blue-50' : ''
                                }`}
                        >
                            <span className="font-medium text-gray-900">{schedule.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );

    const handleReceiptChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setReceiptFileName(file.name);
            convertFileToBase64(file);
        }
    };

    const handleReceiptClick = () => {
        receiptRef.current?.click();
    };

    const convertFileToBase64 = (file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64data = reader.result.split(',')[1];
            setReceiptFile(base64data);
        };
        reader.readAsDataURL(file);
    };

    const prepareOrderData = () => {
        const products = cart.items.map(item => ({
            product_id: item.product.id,
            note: item.note,
            count: item.quantity,
            addons: Object.entries(item.addons)
                .filter(([_, addonData]) => addonData.checked)
                .map(([addonId, addonData]) => ({
                    addon_id: parseInt(addonId),
                    count: addonData.quantity || 1
                })),
            exclude_id: item.excludes,
            extra_id: Object.entries(item.extras)
                .filter(([_, quantity]) => quantity > 0)
                .map(([extraId]) => parseInt(extraId)),
            variation: Object.entries(item.variations).map(([variationId, optionIds]) => ({
                variation_id: parseInt(variationId),
                option_id: Array.isArray(optionIds) ? optionIds : [optionIds]
            }))
        }));

        return {
            notes: notes,
            payment_method_id: selectedPaymentMethod?.id,
            receipt: receiptFile,
            branch_id: orderType === 'take_away' ? selectedBranchId : "",
            address_id: orderType === 'delivery' ? selectedAddressId : "",
            amount: orderSummary.total,
            total_tax: cart.totalTax,
            total_discount: cart.totalDiscount,
            delivery_price: orderSummary.delivery,
            order_type: orderType,
            sechedule_slot_id: selectedSchedule?.id,
            products: products,
            source: "web",
            confirm_order: 0
        };
    };

    const handleSendOrder = async () => {
        if (!selectedPaymentMethod) {
            alert(t('pleaseSelectPaymentMethod'));
            return;
        }

        // Validate that required location is selected
        if (orderType === 'delivery' && !selectedAddressId) {
            alert('Please select a delivery address');
            return;
        }

        if (orderType === 'take_away' && !selectedBranchId) {
            alert('Please select a branch');
            return;
        }

        const orderData = prepareOrderData();
        console.log('Sending order data:', orderData);

        try {
            await postOrder(orderData);
        } catch (error) {
            if (error?.response?.data?.errors === "You has order at proccessing") {
                setPendingOrderData(orderData);
                setShowProcessingModal(true);
            } else {
                console.error('Order error:', error);
                alert('Failed to place order. Please try again.');
            }
        }
    };

    const handleConfirmOrder = () => {
        setShowProcessingModal(false);
        postOrder({ ...pendingOrderData, confirm_order: 1 });
    };

    const handleCancelOrder = () => {
        setShowProcessingModal(false);
        navigate("/", { replace: true });
    };

    useEffect(() => {
        if (responseOrder) {
            if (responseOrder.data?.paymentLink) {
                window.open(responseOrder.data.paymentLink, "_blank");
            } else {
                navigate(`order_traking/${responseOrder?.data?.success}`, {
                    replace: true,
                });
            }
        }
    }, [responseOrder, navigate]);

    if (loadingPaymentMethod || loadingSchedule) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <StaticSpinner />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        {t('checkout')}
                    </h1>
                    <p className="text-lg text-gray-600">
                        {t('completeYourOrder')}
                    </p>
                </div>

                {/* Location Validation Warning */}
                {(orderType === 'delivery' && !selectedAddressId) ||
                    (orderType === 'take_away' && !selectedBranchId) ? (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center">
                            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                            <p className="text-red-700">
                                {orderType === 'delivery'
                                    ? 'Please select a delivery address before proceeding'
                                    : 'Please select a branch before proceeding'
                                }
                            </p>
                        </div>
                    </div>
                ) : null}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Order Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Summary Card */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <Receipt className="h-6 w-6 text-mainColor" />
                                {t('orderSummary')}
                            </h2>

                            <div className="space-y-4">
                                {cart.items.map((item) => (
                                    <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                        <img
                                            src={item.product.image_link}
                                            alt={item.product.name}
                                            className="w-16 h-16 rounded-lg object-cover"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                            <p className="text-lg font-bold text-mainColor">
                                                {item.totalPrice.toFixed(2)} EGP
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Delivery Information */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                {orderType === 'delivery' ? (
                                    <Truck className="h-6 w-6 text-mainColor" />
                                ) : (
                                    <Store className="h-6 w-6 text-mainColor" />
                                )}
                                {orderType === 'delivery' ? t('deliveryInfo') : t('pickupInfo')}
                            </h2>

                            {orderType === 'delivery' && selectedAddress ? (
                                <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                                    <MapPin className="h-8 w-8 text-blue-600" />
                                    <div>
                                        <p className="font-semibold text-gray-900">{selectedAddress.address}</p>
                                        <p className="text-sm text-gray-600">{selectedAddress.additional_data}</p>
                                        {selectedAddress.zone?.price && (
                                            <p className="text-sm text-green-600 font-medium">
                                                Delivery fee: {selectedAddress.zone.price} EGP
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ) : orderType === 'take_away' && selectedBranch ? (
                                <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                                    <Store className="h-8 w-8 text-blue-600" />
                                    <div>
                                        <p className="font-semibold text-gray-900">{selectedBranch.name}</p>
                                        <p className="text-sm text-gray-600">{selectedBranch.address}</p>
                                        <p className="text-sm text-gray-500">{selectedBranch.phone}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 bg-yellow-50 rounded-lg">
                                    <p className="text-yellow-700">
                                        {orderType === 'delivery'
                                            ? 'No delivery address selected'
                                            : 'No branch selected'
                                        }
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Schedule Time */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <Clock className="h-6 w-6 text-mainColor" />
                                {t('scheduleTime')}
                            </h2>

                            <ScheduleSelect />

                            {selectedSchedule && (
                                <div className="flex items-center space-x-2 text-sm text-gray-600 mt-3">
                                    <Calendar className="h-4 w-4" />
                                    <span>{t('selectedTime')}: {selectedSchedule.name}</span>
                                </div>
                            )}
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <CreditCard className="h-6 w-6 text-mainColor" />
                                {t('paymentMethod')}
                            </h2>

                            <PaymentMethodSelect />

                            {selectedPaymentMethod && (
                                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg mt-3">
                                    <img
                                        src={selectedPaymentMethod.logo_link}
                                        alt={selectedPaymentMethod.name}
                                        className="w-8 h-8 object-contain"
                                    />
                                    <div>
                                        <p className="font-semibold text-gray-900">{selectedPaymentMethod.name}</p>
                                        {selectedPaymentMethod.description && (
                                            <p className="text-sm text-gray-600">{selectedPaymentMethod.description}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Additional Notes & Receipt */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <FileText className="h-6 w-6 text-mainColor" />
                                {t('additionalInformation')}
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('specialInstructions')}
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder={t('addSpecialInstructions')}
                                        className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-mainColor"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('uploadReceipt')} (Optional)
                                    </label>
                                    <div className="flex items-center space-x-4">
                                        <button
                                            type="button"
                                            onClick={handleReceiptClick}
                                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            {t('chooseFile')}
                                        </button>
                                        <span className="text-sm text-gray-600">
                                            {receiptFileName || t('noFileChosen')}
                                        </span>
                                    </div>
                                    <input
                                        type="file"
                                        ref={receiptRef}
                                        onChange={handleReceiptChange}
                                        className="hidden"
                                        accept="image/*,.pdf"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Supported formats: JPG, PNG, PDF
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Order Summary & Checkout */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">
                                {t('orderTotal')}
                            </h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal ({cart.itemCount} items)</span>
                                    <span>{orderSummary.subtotal.toFixed(2)} EGP</span>
                                </div>

                                {orderSummary.discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>{t('discount')}</span>
                                        <span>-{orderSummary.discount.toFixed(2)} EGP</span>
                                    </div>
                                )}

                                {orderSummary.tax > 0 && (
                                    <div className="flex justify-between text-blue-600">
                                        <span>{t('tax')}</span>
                                        <span>+{orderSummary.tax.toFixed(2)} EGP</span>
                                    </div>
                                )}

                                {orderSummary.delivery > 0 && (
                                    <div className="flex justify-between text-purple-600">
                                        <span>{t('deliveryFee')}</span>
                                        <span>+{orderSummary.delivery.toFixed(2)} EGP</span>
                                    </div>
                                )}

                                <div className="border-t pt-3">
                                    <div className="flex justify-between text-lg font-bold text-gray-900">
                                        <span>{t('total')}</span>
                                        <span>{orderSummary.total.toFixed(2)} EGP</span>
                                    </div>
                                </div>
                            </div>

                            {/* Security Badge */}
                            <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg mb-6">
                                <Shield className="h-5 w-5 text-green-600" />
                                <span className="text-sm text-green-700">
                                    {t('secureCheckout')}
                                </span>
                            </div>

                            {/* Checkout Button */}
                            <button
                                onClick={handleSendOrder}
                                disabled={loadingOrder || !selectedPaymentMethod ||
                                    (orderType === 'delivery' && !selectedAddressId) ||
                                    (orderType === 'take_away' && !selectedBranchId)}
                                className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 ${loadingOrder || !selectedPaymentMethod ||
                                        (orderType === 'delivery' && !selectedAddressId) ||
                                        (orderType === 'take_away' && !selectedBranchId)
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-mainColor to-blue-600 text-white hover:shadow-lg transform hover:scale-105'
                                    }`}
                            >
                                {loadingOrder ? (
                                    <div className="flex items-center justify-center">
                                        <StaticSpinner size="small" />
                                        <span className="ml-2">{t('processing')}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center">
                                        <CheckCircle className="h-5 w-5 mr-2" />
                                        {t('placeOrder')}
                                    </div>
                                )}
                            </button>

                            {/* Guarantee */}
                            <div className="mt-4 text-center">
                                <p className="text-xs text-gray-500">
                                    {t('satisfactionGuarantee')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Processing Order Modal */}
            {showProcessingModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleCancelOrder} />

                        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <AlertCircle className="w-8 h-8 text-yellow-500" />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {t("OrderAlreadyinProgress")}
                                    </h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            {t("Youcurrently")}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex space-x-3">
                                <button
                                    onClick={handleConfirmOrder}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-mainColor border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    {t("PlaceNewOrder")}
                                </button>
                                <button
                                    onClick={handleCancelOrder}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    {t("NoCancel")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckOut;