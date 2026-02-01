import React, { useState, useMemo, useEffect } from "react";
import { useCart } from "../context/CartContext.jsx";
import axios from "axios";
import api from "../api/client";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ItemTable from "../components/cart/ItemTable.jsx";
import DeliveryAddress from "../components/checkout/DeliveryAddress.jsx";
import PaymentMethod from "../components/checkout/PaymentMethod.jsx";
import CheckoutSummary from "../components/checkout/CheckoutSummary.jsx";

const API_URL = import.meta.env.VITE_API_URL;

const Checkout = () => {
    const { cartItem, updateQuantity, deleteItem, setCartItem } = useCart();
    const navigate = useNavigate();

    // Removed selection checkboxes for a cleaner mobile layout

    // Delivery address
    const [addressType, setAddressType] = useState("home");
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [division, setDivision] = useState("");
    const [district, setDistrict] = useState("");
    const [subDistrict, setSubDistrict] = useState("");

    // Payment
    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [paymentDetails, setPaymentDetails] = useState({
        paid_from: "",
        transaction_id: "",
    });

    // Voucher/discount
    const [voucher, setVoucher] = useState("");
    const [discount, setDiscount] = useState(0);
    const applyVoucher = () => {
        setDiscount(voucher.trim().toUpperCase() === "SAVE300" ? 300 : 0);
    };

    // Terms
    const [accepted, setAccepted] = useState(false);
    const [loading, setLoading] = useState(false);

    // Auto-fill for authenticated users
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            // 1. Fetch User Profile
            axios.get(`${API_URL}/customers/me/`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => {
                    if (res.data) {
                        if (res.data.id) {
                            localStorage.setItem('user_id', String(res.data.id));
                        }
                        // Name
                        if (res.data.name) setFullName(res.data.name);
                        else if (res.data.username) setFullName(res.data.username);

                        // Email
                        if (res.data.email) setEmail(res.data.email);

                        // Phone
                        if (res.data.phone_number) setPhone(res.data.phone_number);
                        else if (res.data.phone) setPhone(res.data.phone);
                    }
                })
                .catch((err) => {
                    console.error("Error fetching user profile:", err);
                });

            // 2. Fetch User Addresses
            axios.get(`${API_URL}/addresses/`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => {
                    // Check if we have results array (pagination) or direct array
                    const addresses = Array.isArray(res.data) ? res.data : (res.data.results || []);

                    if (addresses.length > 0) {
                        let foundAddress = null;

                        // Priority 1: Default address
                        foundAddress = addresses.find(addr => addr.is_default);

                        // Priority 2: First address if no default
                        if (!foundAddress) {
                            foundAddress = addresses[0];
                        }

                        if (foundAddress) {
                            if (foundAddress.address) setAddress(foundAddress.address);
                            if (foundAddress.division) setDivision(foundAddress.division);
                            if (foundAddress.district) setDistrict(foundAddress.district);
                            if (foundAddress.sub_district) setSubDistrict(foundAddress.sub_district);

                            // Also override name/phone if present in address and not set by profile
                            // Or prefer address details for shipping? Usually yes.
                            if (foundAddress.full_name) setFullName(foundAddress.full_name);
                            if (foundAddress.phone) setPhone(foundAddress.phone);
                            if (foundAddress.address_type) setAddressType(foundAddress.address_type.toLowerCase());
                        }
                    }
                })
                .catch((err) => {
                    console.error("Error fetching addresses:", err);
                });
        }
    }, []);

    // Totals (based on selected rows)
    const subtotal = useMemo(() => {
        return cartItem.reduce(
            (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
            0
        );
    }, [cartItem]);
    const deliveryCharge = 120;
    const deliveryDiscount = 0;
    const totalPayable = Math.max(
        0,
        subtotal + deliveryCharge - deliveryDiscount - discount
    );

    const handlePlaceOrder = async () => {
        if (!fullName || !phone || !address || !division || !district || !subDistrict || !email) {
            toast.error("Please fill in all required fields");
            return;
        }

        setLoading(true);
        try {
            // Prepare items — prefer variant_id if available
            const itemsInput = cartItem.map(item => (
                item.variant?.id
                    ? { variant_id: item.variant.id, quantity: item.quantity }
                    : { product_id: item.id, quantity: item.quantity }
            ));

            // Create Order Payload
            // Sending address details directly for guest/new address
            // Using specific keys required by backend for guest checkout: full_name, shipping_address
            const orderPayload = {
                items_input: itemsInput,
                email: email,
                full_name: fullName,
                phone: phone,
                shipping_address: address,
                division: division,
                district: district,
                sub_district: subDistrict,
                address_type: addressType,
                payment_method: paymentMethod,
                payment_details: paymentMethod !== "cod" ? paymentDetails : null,
            };

            const response = await api.post('/orders/', orderPayload);

            toast.success("Order placed successfully!");
            setCartItem([]); // Clear cart

            const token = localStorage.getItem('access_token');
            if (token) {
                navigate("/dashboard", {
                    state: {
                        newOrder: {
                            total: totalPayable,
                            items_count: itemsInput.length,
                            order_id: response?.data?.id ?? null
                        }
                    }
                });
            } else {
                navigate("/order-success", { state: { email, name: fullName, phone } });
            }

        } catch (error) {
            console.error("Order placement error:", error);

            // Handle server errors (often HTML) gracefully
            if (error.response && error.response.status >= 500) {
                // Check for specific Django "DoesNotExist" HTML response content if possible, 
                // but usually we just see 500. 
                // If the user sees "Product matching query does not exist", it implies a 500/404 from backend logic.
                toast.error("Server error: Some items in your cart may no longer exist. Please clear your cart and try again.");
                return;
            }

            let msg = "Failed to place order. Please try again.";

            if (error.response?.data) {
                if (typeof error.response.data === 'string' && error.response.data.trim().startsWith('<')) {
                    if (error.response.data.includes("Product matching query does not exist")) {
                        msg = "One or more items in your cart are no longer available. Please clear your cart.";
                    } else {
                        msg = `Server Error (${error.response.status}): ${error.response.statusText}`;
                    }
                } else if (error.response.data.detail) {
                    msg = error.response.data.detail;
                } else if (error.response.data.message) {
                    msg = error.response.data.message;
                } else {
                    // Try to extract first validation error
                    const values = Object.values(error.response.data);
                    if (values.length > 0 && Array.isArray(values[0])) {
                        msg = values[0][0]; // "Invalid pk '0'" or "Guest checkout requires..."
                    } else {
                        msg = JSON.stringify(error.response.data);
                    }
                }
            }

            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4">
            <h1 className="text-2xl md:text-3xl font-bold mb-6 text-neutral-800 uppercase">
                Shopping Cart
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column: Cart table + Delivery Address */}
                <div className="lg:col-span-2">
                    <ItemTable
                        items={cartItem}
                        onDecrease={(id, vid) => updateQuantity(id, "decrease", undefined, vid)}
                        onIncrease={(id, vid) => updateQuantity(id, "increase", undefined, vid)}
                        onSet={(id, qty, vid) => updateQuantity(id, "set", qty, vid)}
                        onRemove={(id, vid) => deleteItem(id, vid)}
                    />

                    <DeliveryAddress
                        email={email}
                        fullName={fullName}
                        phone={phone}
                        division={division}
                        district={district}
                        subDistrict={subDistrict}
                        address={address}
                        addressType={addressType}
                        onEmailChange={(e) => setEmail(e.target.value)}
                        onFullNameChange={(e) => setFullName(e.target.value)}
                        onPhoneChange={(e) => setPhone(e.target.value)}
                        onDivisionChange={(e) => setDivision(e.target.value)}
                        onDistrictChange={(e) => setDistrict(e.target.value)}
                        onSubDistrictChange={(e) => setSubDistrict(e.target.value)}
                        onAddressChange={(e) => setAddress(e.target.value)}
                        onAddressTypeChange={setAddressType}
                    />
                </div>

                {/* Right column: Payment + Summary */}
                <div className="space-y-6">
                    <PaymentMethod
                        paymentMethod={paymentMethod}
                        onChange={setPaymentMethod}
                        paymentDetails={paymentDetails}
                        onDetailsChange={setPaymentDetails}
                        totalPayable={totalPayable}
                    />

                    <CheckoutSummary
                        subtotal={subtotal}
                        deliveryCharge={deliveryCharge}
                        deliveryDiscount={deliveryDiscount}
                        discount={discount}
                        voucher={voucher}
                        accepted={accepted}
                        loading={loading}
                        onVoucherChange={(e) => setVoucher(e.target.value)}
                        onApplyVoucher={applyVoucher}
                        onAcceptedChange={(e) => setAccepted(e.target.checked)}
                        onConfirmOrder={handlePlaceOrder}
                        onNavigateTerms={() => navigate("/terms")}
                    />
                </div>
            </div>
        </div>
    );
};

export default Checkout;
