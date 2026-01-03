import React, { useState, useMemo, useEffect } from "react";
import { useCart } from "../context/CartContext.jsx";
import axios from "axios";
import api from "../api/client";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
    FaMinus,
    FaPlus,
    FaTrash,
    FaHome,
    FaBuilding,
    FaCheck,
    FaMobileAlt,
} from "react-icons/fa";
import { FaMoneyBillWave } from "react-icons/fa";
import { SiVisa, SiMastercard } from "react-icons/si";

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
    const deliveryCharge = 70;
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
            // Prepare items
            const itemsInput = cartItem.map(item => ({
                product_id: item.id,
                quantity: item.quantity
            }));

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
                payment_method: paymentMethod
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
                    {/* Items table */}
                    <div className="bg-white border rounded-lg overflow-hidden">
                        {/* Header row */}
                        <div className="grid grid-cols-12 items-center px-4 py-3 border-b text-gray-700 gap-x-2">
                            <div className="col-span-1"></div>
                            <div className="col-span-4 font-medium">Product</div>
                            <div className="col-span-2 font-medium text-center">Price</div>
                            <div className="col-span-1 font-medium text-center">Qty.</div>
                            <div className="col-span-2 font-medium text-right">Total</div>
                            <div className="col-span-2 font-medium text-center">Action</div>
                        </div>

                        {/* Item rows */}
                        <div className="divide-y">
                            {cartItem.map((item) => (
                                <div
                                    key={item.id}
                                    className="grid grid-cols-12 items-center px-4 py-3 gap-x-2"
                                >
                                    <div className="col-span-2 flex items-center">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-12 h-12 object-cover rounded"
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <div className="text-sm md:text-base font-semibold text-gray-800">
                                            {item.name}
                                        </div>
                                    </div>
                                    <div className="col-span-2 text-center text-gray-800 pr-2">
                                        {item.price}
                                    </div>
                                    <div className="col-span-2">
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                aria-label="Decrease quantity"
                                                className="w-7 h-7 rounded-md text-purple-600 flex items-center justify-center text-xs"
                                                onClick={() =>
                                                    updateQuantity(cartItem, item.id, "decrease")
                                                }
                                            >
                                                <FaMinus size={12} />
                                            </button>
                                            <input
                                                className="min-w-10 w-14 text-center text-md border border-gray-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) =>
                                                    updateQuantity(
                                                        cartItem,
                                                        item.id,
                                                        "set",
                                                        Number(e.target.value)
                                                    )
                                                }
                                            />
                                            <button
                                                aria-label="Increase quantity"
                                                className="w-7 h-7 rounded-md text-purple-600 flex items-center justify-center text-xs"
                                                onClick={() =>
                                                    updateQuantity(cartItem, item.id, "increase")
                                                }
                                            >
                                                <FaPlus size={12} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-span-2 text-right font-medium">
                                        {((item.price || 0) * (item.quantity || 0)).toFixed(0)}
                                    </div>
                                    <div className="col-span-1 text-center">
                                        <button
                                            aria-label={`Remove ${item.name}`}
                                            className="p-1.5 rounded-md bg-purple-600 hover:bg-purple-700 text-white"
                                            onClick={() => deleteItem(item.id)}
                                        >
                                            <FaTrash size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="mt-6 bg-white border rounded-lg p-4">
                        <h2 className="text-xl font-bold mb-4 text-neutral-800">
                            Delivery Address
                        </h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="w-full border rounded-md px-3 py-2"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    className="w-full border rounded-md px-3 py-2"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ex:01xxxxxxxxx"
                                    className="w-full border rounded-md px-3 py-2"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="House no. / Building / Street"
                                className="w-full border rounded-md px-3 py-2"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Division <span className="text-red-500">*</span>
                                </label>
                                <select
                                    className="w-full border rounded-md px-3 py-2"
                                    value={division}
                                    onChange={(e) => setDivision(e.target.value)}
                                >
                                    <option value="">Select Division</option>
                                    <option>Dhaka</option>
                                    <option>Chattogram</option>
                                    <option>Rajshahi</option>
                                    <option>Khulna</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    District <span className="text-red-500">*</span>
                                </label>
                                <select
                                    className="w-full border rounded-md px-3 py-2"
                                    value={district}
                                    onChange={(e) => setDistrict(e.target.value)}
                                >
                                    <option value="">Select District</option>
                                    {/* Ensure auto-filled value is shown if not in the list */}
                                    {district && !["Dhaka", "Gazipur", "Narayanganj", "Kishoreganj", "Comilla", "Sylhet"].includes(district) && (
                                        <option value={district}>{district}</option>
                                    )}
                                    <option>Dhaka</option>
                                    <option>Gazipur</option>
                                    <option>Narayanganj</option>
                                    <option>Kishoreganj</option>
                                    <option>Comilla</option>
                                    <option>Sylhet</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Sub District <span className="text-red-500">*</span>
                                </label>
                                <select
                                    className="w-full border rounded-md px-3 py-2"
                                    value={subDistrict}
                                    onChange={(e) => setSubDistrict(e.target.value)}
                                >
                                    <option value="">Select Sub District</option>
                                    {/* Ensure auto-filled value is shown if not in the list */}
                                    {subDistrict && !["Uttara", "Banani", "Mirpur", "Kishoreganj", "Sadar"].includes(subDistrict) && (
                                        <option value={subDistrict}>{subDistrict}</option>
                                    )}
                                    <option>Uttara</option>
                                    <option>Banani</option>
                                    <option>Mirpur</option>
                                    <option>Kishoreganj</option>
                                    <option>Sadar</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                className={`px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 ${addressType === "home" ? "" : "opacity-70"
                                    }`}
                                onClick={() => setAddressType("home")}
                            >
                                <FaHome /> Home{" "}
                                {addressType === "home" && <FaCheck className="ml-1" />}
                            </button>
                            <button
                                className={`px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 ${addressType === "office" ? "" : "opacity-70"
                                    }`}
                                onClick={() => setAddressType("office")}
                            >
                                <FaBuilding /> Office{" "}
                                {addressType === "office" && <FaCheck className="ml-1" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right column: Payment + Summary */}
                <div className="space-y-6">
                    {/* Payment options */}
                    <div className="bg-white border rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-3 text-neutral-800">
                            Select Payment Method
                        </h3>
                        <div className="space-y-3">
                            <label className="flex items-center justify-between p-2 rounded">
                                <span className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="pm"
                                        value="cod"
                                        checked={paymentMethod === "cod"}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <span>Cash on Delivery</span>
                                </span>
                                <FaMoneyBillWave className="text-green-600" />
                            </label>
                            <label className="flex items-center justify-between p-2 rounded">
                                <span className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="pm"
                                        value="bkash"
                                        checked={paymentMethod === "bkash"}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <span>Bkash</span>
                                </span>
                                <FaMobileAlt className="text-pink-500" />
                            </label>
                            <label className="flex items-center justify-between p-2 rounded">
                                <span className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="pm"
                                        value="nagad"
                                        checked={paymentMethod === "nagad"}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <span>Nagad</span>
                                </span>
                                <FaMobileAlt className="text-orange-500" />
                            </label>
                            <label className="flex items-center justify-between p-2 rounded">
                                <span className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="pm"
                                        value="upay"
                                        checked={paymentMethod === "upay"}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <span>Upay</span>
                                </span>
                                <FaMobileAlt className="text-yellow-600" />
                            </label>
                            <label className="flex items-center justify-between p-2 rounded">
                                <span className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="pm"
                                        value="card_mfs"
                                        checked={paymentMethod === "card_mfs"}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <span>Card & MFS</span>
                                </span>
                                <span className="flex items-center gap-2">
                                    <SiVisa className="text-blue-600" />
                                    <SiMastercard className="text-orange-600" />
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-white border rounded-lg p-4 h-fit">
                        <h2 className="text-lg font-semibold mb-3 text-neutral-800">
                            Checkout Summary
                        </h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">৳ {subtotal.toFixed(0)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Delivery Charge</span>
                                <span className="font-medium">৳ {deliveryCharge}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Delivery Charge Discount</span>
                                <span className="font-medium">৳ {deliveryDiscount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Discount</span>
                                <span className="font-medium">৳ {discount}</span>
                            </div>
                        </div>

                        {/* Voucher */}
                        <div className="mt-3 flex items-center gap-2">
                            <input
                                className="flex-1 border rounded-md px-3 py-2 text-sm"
                                placeholder="Have a voucher code"
                                value={voucher}
                                onChange={(e) => setVoucher(e.target.value)}
                            />
                            <button
                                className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white"
                                onClick={applyVoucher}
                            >
                                Apply
                            </button>
                        </div>

                        <div className="border-t pt-3 mt-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-800 font-semibold">
                                    Total Payable
                                </span>
                                <span className="text-gray-900 font-bold">
                                    ৳ {totalPayable.toFixed(0)}
                                </span>
                            </div>
                        </div>

                        <div className="mt-3 text-sm">
                            <label className="inline-flex items-start gap-2">
                                <input
                                    type="checkbox"
                                    checked={accepted}
                                    onChange={(e) => setAccepted(e.target.checked)}
                                />
                                <span>
                                    * I agree to the{" "}
                                    <a href="#" className="text-purple-600 underline">
                                        terms and conditions
                                    </a>
                                </span>
                            </label>
                        </div>

                        <button
                            className="mt-4 w-full px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center"
                            disabled={!accepted || loading}
                            onClick={handlePlaceOrder}
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                "Confirm Order"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
