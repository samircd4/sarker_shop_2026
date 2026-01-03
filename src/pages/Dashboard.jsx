import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaUser, FaBoxOpen, FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';
import api from '../api/client';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL;

const Dashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState({ name: 'User', email: '' });
    const [activeTab, setActiveTab] = useState('dashboard');
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [ordersError, setOrdersError] = useState('');
    const [profileName, setProfileName] = useState('');
    const [profileEmail, setProfileEmail] = useState('');
    const [profilePhone, setProfilePhone] = useState('');
    const [profileImagePreview, setProfileImagePreview] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [addressesLoading, setAddressesLoading] = useState(false);
    const [addressesError, setAddressesError] = useState('');
    const [addrFullName, setAddrFullName] = useState('');
    const [addrPhone, setAddrPhone] = useState('');
    const [addrAddress, setAddrAddress] = useState('');
    const [addrDivision, setAddrDivision] = useState('');
    const [addrDistrict, setAddrDistrict] = useState('');
    const [addrSubDistrict, setAddrSubDistrict] = useState('');
    const [addrType, setAddrType] = useState('Home');
    const [addrDefault, setAddrDefault] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);
    const BD_REGIONS = {
        Dhaka: {
            districts: {
                Dhaka: ['Uttara', 'Banani', 'Mirpur'],
                Gazipur: ['Sadar'],
                Narayanganj: ['Sadar']
            }
        },
        Chattogram: {
            districts: {
                Comilla: ['Sadar']
            }
        },
        Rajshahi: {
            districts: {
                Rajshahi: ['Sadar']
            }
        },
        Khulna: {
            districts: {
                Khulna: ['Sadar']
            }
        }
    };
    const sortOrdersDesc = (arr) => {
        return [...arr].sort((a, b) => {
            const ad = new Date(a.created_at || a.created || a.createdAt || 0).getTime();
            const bd = new Date(b.created_at || b.created || b.createdAt || 0).getTime();
            if (!isNaN(ad) && !isNaN(bd)) return bd - ad;
            return (b.id ?? 0) - (a.id ?? 0);
        });
    };
    const formatDate = (s) => {
        const d = new Date(s);
        if (isNaN(d)) return s || '';
        let h = d.getHours();
        const m = d.getMinutes().toString().padStart(2, '0');
        const ap = h >= 12 ? 'PM' : 'AM';
        h = h % 12;
        if (h === 0) h = 12;
        const dd = d.getDate().toString().padStart(2, '0');
        const mm = (d.getMonth() + 1).toString().padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${dd}-${mm}-${yyyy}  ${h}:${m} ${ap}`;
    };
    const normalizeStatus = (s) => (s || '').toString().toLowerCase();
    const statusChipClass = (status) => {
        const n = normalizeStatus(status);
        if (n.includes('cancelled')) return 'bg-red-200 text-red-800';
        if (n.includes('pending')) return 'bg-red-100 text-red-800';
        if (n.includes('completed')) return 'bg-green-100 text-green-800';
        if (n.includes('shipped')) return 'bg-yellow-100 text-yellow-800';
        // shipped or others: keep as is (purple)
        return 'bg-purple-100 text-purple-800';
    };
    const isPaid = (o) => {
        if (typeof o?.payment?.is_paid === 'boolean') return o.payment.is_paid;
        const ps = (o?.payment_status || o?.payment?.status || '').toString().toLowerCase();
        return ps.includes('paid');
    };
    const getPaymentStatus = (o) => (isPaid(o) ? 'Paid' : 'Unpaid');
    const paymentChipClass = (o) => (isPaid(o) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800');
    const getTransactionId = (o) => o?.payment?.transaction_id || o?.transaction_id || o?.payment?.trx_id || o?.payment?.id || 'N/A';
    const getPaymentMethod = (o) => o?.payment?.payment_method || 'N/A';
    const formatAddress = (addr) => {
        if (!addr) return 'Not available';
        if (typeof addr === 'string') return addr;
        const parts = [];
        if (addr.full_name) parts.push(addr.full_name);
        if (addr.phone) parts.push(addr.phone);
        parts.push(
            addr.address ||
            addr.line1 || addr.address_line1 || addr.address1,
        );
        parts.push(
            addr.line2 || addr.address_line2 || addr.address2,
        );
        parts.push(addr.sub_district, addr.district, addr.division);
        parts.push(addr.city, addr.state);
        parts.push(addr.postcode || addr.zip || addr.postal_code);
        parts.push(addr.country);
        const filtered = parts.filter(Boolean);
        return filtered.length ? filtered.join(', ') : 'Not available';
    };
    const downloadInvoice = async (order) => {
        if (!order?.id) return;

        try {
            const res = await api.get(
                `/orders/${order.id}/invoice/`,
                { responseType: 'blob' }
            );

            const blob = new Blob([res.data], {
                type: res.headers['content-type'] || 'application/pdf',
            });

            const url = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `invoice_${order.id}.pdf`;

            document.body.appendChild(a);
            a.click();
            a.remove();

            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.log(error);
            console.error('Invoice download failed:', error);
            alert('Unable to download invoice. Please try again.');
        }
    };


    // Check for order success state passed from checkout
    const newOrder = location.state?.newOrder;

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/account');
            return;
        }

        // Fetch user profile
        axios.get(`${API_URL}/customers/me/`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                if (res.data) {
                    setUser({
                        name: res.data.name || res.data.username || 'User',
                        email: res.data.email || ''
                    });
                    setProfileName(res.data.name || res.data.username || '');
                    setProfileEmail(res.data.email || '');
                    setProfilePhone(res.data.phone_number || res.data.phone || '');
                    setProfileImagePreview(res.data.avatar || res.data.image || '');
                }
            })
            .catch(err => {
                console.error("Failed to fetch user profile:", err);
                if (err.response && err.response.status === 401) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    navigate('/account');
                }
            });
    }, [navigate]);

    const onProfileImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setProfileImagePreview(url);
    };

    const onProfileSave = () => {
        if (!profileName || !profileEmail) {
            toast.error('Name and email are required');
            return;
        }
        setSavingProfile(true);
        setTimeout(() => {
            toast.success('Profile updated (UI only). API integration pending.');
            setSavingProfile(false);
            setUser({ name: profileName || 'User', email: profileEmail || '' });
        }, 600);
    };

    const fetchAddresses = async () => {
        try {
            setAddressesLoading(true);
            setAddressesError('');
            const res = await api.get('/addresses/');
            const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
            setAddresses(data);
        } catch (err) {
            const msg = err.response?.data?.detail || 'Unable to load addresses';
            setAddressesError(msg);
        } finally {
            setAddressesLoading(false);
        }
    };

    const resetAddressForm = () => {
        setAddrFullName('');
        setAddrPhone('');
        setAddrAddress('');
        setAddrDivision('');
        setAddrDistrict('');
        setAddrSubDistrict('');
        setAddrType('Home');
        setAddrDefault(false);
        setEditingAddressId(null);
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        if (!addrFullName || !addrPhone || !addrAddress || !addrDivision || !addrDistrict || !addrSubDistrict) {
            toast.error('Please fill in all required fields');
            return;
        }
        const payload = {
            full_name: addrFullName,
            phone: addrPhone,
            address: addrAddress,
            division: addrDivision,
            district: addrDistrict,
            sub_district: addrSubDistrict,
            address_type: addrType,
            is_default: Boolean(addrDefault)
        };
        try {
            if (editingAddressId) {
                await api.put(`/addresses/${editingAddressId}/`, payload);
                toast.success('Address updated');
            } else {
                await api.post('/addresses/', payload);
                toast.success('Address added');
            }
            const res = await api.get('/addresses/');
            const list = Array.isArray(res.data) ? res.data : (res.data.results || []);
            if (addrDefault) {
                const targetId = editingAddressId || (list.length ? list.sort((a, b) => (b.id ?? 0) - (a.id ?? 0))[0]?.id : null);
                if (targetId) await handleSetDefault(targetId);
            }
            await fetchAddresses();
            resetAddressForm();
        } catch (err) {
            const msg = err.response?.data?.detail || 'Failed to save address';
            toast.error(msg);
        }
    };

    const handleEditAddress = (addr) => {
        setEditingAddressId(addr.id);
        setAddrFullName(addr.full_name || '');
        setAddrPhone(addr.phone || '');
        setAddrAddress(addr.address || '');
        setAddrDivision(addr.division || '');
        setAddrDistrict(addr.district || '');
        setAddrSubDistrict(addr.sub_district || '');
        setAddrType(addr.address_type || 'Home');
        setAddrDefault(Boolean(addr.is_default));
    };

    const handleDeleteAddress = async (addr) => {
        try {
            await api.delete(`/addresses/${addr.id}/`);
            toast.success('Address removed');
            await fetchAddresses();
            if (addr.is_default && addresses.length > 0) {
                const first = addresses.find(a => a.id !== addr.id);
                if (first) {
                    await handleSetDefault(first.id);
                    await fetchAddresses();
                }
            }
        } catch (err) {
            const msg = err.response?.data?.detail || 'Failed to delete address';
            toast.error(msg);
        }
    };

    const handleSetDefault = async (id) => {
        try {
            await api.patch(`/addresses/${id}/`, { is_default: true });
            const others = (addresses || []).filter(a => a.id !== id && a.is_default);
            for (const o of others) {
                try {
                    await api.patch(`/addresses/${o.id}/`, { is_default: false });
                } catch (e) {
                    console.error(e);
                }
            }
            toast.success('Default address set');
            await fetchAddresses();
        } catch (err) {
            const msg = err.response?.data?.detail || 'Failed to set default address';
            toast.error(msg);
        }
    };

    useEffect(() => {
        if (activeTab !== 'address') return;
        fetchAddresses();
    }, [activeTab]);

    useEffect(() => {
        if (activeTab !== 'orders' && activeTab !== 'dashboard') return;
        setOrdersLoading(true);
        setOrdersError('');
        api.get('/orders/')
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
                setOrders(data);
            })
            .catch(err => {
                console.error('Failed to fetch orders:', err);
                const msg = err.response?.data?.detail || 'Unable to load orders';
                setOrdersError(msg);
            })
            .finally(() => setOrdersLoading(false));
    }, [activeTab]);

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-neutral-800">My Dashboard</h1>

            {newOrder && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8 flex items-center gap-4">
                    <FaCheckCircle className="text-green-600 text-2xl" />
                    <div>
                        <h3 className="font-bold text-green-800">Order Placed Successfully!</h3>
                        <p className="text-green-700 text-sm">
                            Thank you for your order. You can track it in your order history below.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sidebar / Menu */}
                <div className="md:col-span-1 space-y-2">
                    <div className="bg-white border rounded-lg p-4 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                                <FaUser />
                            </div>
                            <div>
                                <div className="font-semibold text-gray-800">Hello, {user.name}!</div>
                                <div className="text-xs text-gray-500">Welcome back</div>
                            </div>
                        </div>
                        <nav className="space-y-1">
                            <button
                                onClick={() => setActiveTab('dashboard')}
                                className={`w-full text-left px-3 py-2 font-medium rounded ${activeTab === 'dashboard' ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                Dashboard
                            </button>
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`w-full text-left px-3 py-2 rounded ${activeTab === 'orders' ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                My Orders
                            </button>
                            <button
                                onClick={() => setActiveTab('address')}
                                className={`w-full text-left px-3 py-2 rounded ${activeTab === 'address' ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                Addresses
                            </button>
                            <button
                                onClick={() => setActiveTab('profile')}
                                className="w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-50 rounded">
                                Profile Settings
                            </button>
                            <button
                                onClick={() => {
                                    localStorage.removeItem('access_token');
                                    localStorage.removeItem('refresh_token');
                                    navigate('/account');
                                }}
                                className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded"
                            >
                                Logout
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Main Content */}
                <div className="md:col-span-3 space-y-6">
                    {activeTab === 'dashboard' && (
                        <div className="bg-white border rounded-lg p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <FaBoxOpen /> Recent Orders
                                </h2>
                            </div>
                            {ordersLoading && (
                                <div className="flex justify-center items-center py-12">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
                                </div>
                            )}
                            {!ordersLoading && ordersError && (
                                <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
                                    {ordersError}
                                </div>
                            )}
                            {!ordersLoading && !ordersError && (() => {
                                const lastOrder = orders.length ? sortOrdersDesc(orders)[0] : null;
                                if (!lastOrder) {
                                    return (
                                        <div className="text-center py-8 text-gray-500">
                                            No recent orders found.
                                        </div>
                                    );
                                }
                                return (
                                    <div className={`border rounded-lg p-4 bg-white border-gray-200`}>
                                        <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                                            <div className="space-y-1">
                                                <div className="font-semibold text-gray-900">Order #{lastOrder.id}</div>
                                                <div className="text-sm text-gray-500">{formatDate(lastOrder.created_at)}</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusChipClass(lastOrder.status)}`}>
                                                    {lastOrder.status || 'Pending'}
                                                </span>
                                                <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">
                                                    ৳ {lastOrder.total_amount ?? lastOrder.total}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                                            <div className="text-sm">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded ${paymentChipClass(lastOrder)}`}>
                                                    {getPaymentStatus(lastOrder)}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-700">Transaction ID: {getTransactionId(lastOrder)}</div>
                                            <div className="text-sm text-gray-700">Payment Method: {getPaymentMethod(lastOrder)}</div>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="text-left text-gray-600 border-b">
                                                        <th className="py-2 pr-3">Item</th>
                                                        <th className="py-2 pr-3">Qty</th>
                                                        <th className="py-2">Price</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(lastOrder.items || lastOrder.order_items || []).map((it) => (
                                                        <tr key={it.id || `${lastOrder.id}-${it.product?.id || it.product_name}`} className="border-b last:border-0">
                                                            <td className="py-2 pr-3">
                                                                {it.product?.name || it.product_name}
                                                            </td>
                                                            <td className="py-2 pr-3">{it.quantity}</td>
                                                            <td className="py-2">৳ {it.unit_price ?? it.price}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4 pt-4 border-t">
                                            <div className="text-sm text-gray-700">
                                                <div className="font-medium">Shipping Address</div>
                                                <div>{formatAddress(lastOrder.shipping_address)}</div>
                                            </div>
                                            <button
                                                onClick={() => downloadInvoice(lastOrder)}
                                                className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
                                            >
                                                Download Invoice
                                            </button>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="bg-white border rounded-lg p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <FaBoxOpen /> My Orders
                                </h2>
                            </div>

                            {ordersLoading && (
                                <div className="flex justify-center items-center py-12">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
                                </div>
                            )}

                            {!ordersLoading && ordersError && (
                                <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
                                    {ordersError}
                                </div>
                            )}

                            {!ordersLoading && !ordersError && orders.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    No orders found.
                                </div>
                            )}

                            {!ordersLoading && !ordersError && orders.length > 0 && (
                                <div className="space-y-4">
                                    {orders.map((order) => (
                                        <div key={order.id} className={`border rounded-lg p-4 bg-white border-gray-200`}>
                                            <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                                                <div className="space-y-1">
                                                    <div className="font-semibold text-gray-900">Order #{order.id}</div>
                                                    <div className="text-sm text-gray-500">{formatDate(order.created_at)}</div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusChipClass(order.status)}`}>
                                                        {order.status || 'Pending'}
                                                    </span>
                                                    <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">
                                                        ৳ {order.total_amount ?? order.total}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                                                <div className="text-sm">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded ${paymentChipClass(order)}`}>
                                                        {getPaymentStatus(order)}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-700">Transaction ID: {getTransactionId(order)}</div>
                                                <div className="text-sm text-gray-700">Payment Method: {getPaymentMethod(order)}</div>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="text-left text-gray-600 border-b">
                                                            <th className="py-2 pr-3">Item</th>
                                                            <th className="py-2 pr-3">Qty</th>
                                                            <th className="py-2">Price</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {(order.items || order.order_items || []).map((it) => (
                                                            <tr key={it.id || `${order.id}-${it.product?.id || it.product_name}`} className="border-b last:border-0">
                                                                <td className="py-2 pr-3">
                                                                    {it.product?.name || it.product_name}
                                                                </td>
                                                                <td className="py-2 pr-3">{it.quantity}</td>
                                                                <td className="py-2">৳ {it.unit_price ?? it.price}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4 pt-4 border-t">
                                                <div className="text-sm text-gray-700">
                                                    <div className="font-medium">Shipping Address</div>
                                                    <div>{formatAddress(order.shipping_address)}</div>
                                                </div>
                                                <button
                                                    onClick={() => downloadInvoice(order)}
                                                    className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
                                                >
                                                    Download Invoice
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="bg-white border rounded-lg p-6 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Profile Settings</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-1">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-28 h-28 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                                            {profileImagePreview ? (
                                                <img src={profileImagePreview} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-3xl font-bold text-gray-400">
                                                    {profileName?.[0]?.toUpperCase() || user.name?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                            )}
                                        </div>
                                        <label className="cursor-pointer inline-block">
                                            <span className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white">Change Photo</span>
                                            <input type="file" accept="image/*" className="hidden" onChange={onProfileImageChange} />
                                        </label>
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                            <input
                                                type="text"
                                                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                value={profileName}
                                                onChange={(e) => setProfileName(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                            <input
                                                type="email"
                                                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                value={profileEmail}
                                                onChange={(e) => setProfileEmail(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                            <input
                                                type="tel"
                                                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                value={profilePhone}
                                                onChange={(e) => setProfilePhone(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                            <input
                                                type="text"
                                                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                placeholder="Optional"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-6 flex items-center gap-3">
                                        <button
                                            onClick={onProfileSave}
                                            disabled={savingProfile}
                                            className={`px-4 py-2 rounded-md text-white ${savingProfile ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'}`}
                                        >
                                            {savingProfile ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setProfileName(user.name || '');
                                                setProfileEmail(user.email || '');
                                                setProfilePhone('');
                                                setProfileImagePreview('');
                                            }}
                                            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'address' && (
                        <div className="bg-white border rounded-lg p-6 shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2">
                                    <h2 className="text-xl font-bold text-gray-800 mb-4">Saved Addresses</h2>
                                    {addressesLoading && (
                                        <div className="flex justify-center items-center py-12">
                                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
                                        </div>
                                    )}
                                    {!addressesLoading && addressesError && (
                                        <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
                                            {addressesError}
                                        </div>
                                    )}
                                    {!addressesLoading && !addressesError && (addresses || []).length === 0 && (
                                        <div className="text-gray-600">No addresses yet.</div>
                                    )}
                                    {!addressesLoading && !addressesError && (addresses || []).length > 0 && (
                                        <div className="space-y-4">
                                            {(addresses || []).map(addr => (
                                                <div key={addr.id} className={`border rounded-lg p-4 ${addr.is_default ? 'bg-purple-50 border-purple-200' : 'bg-white border-gray-200'}`}>
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="text-sm text-gray-700">
                                                            <div className="font-medium">{addr.full_name}</div>
                                                            <div>{addr.phone}</div>
                                                            <div>{addr.address}</div>
                                                            <div>{[addr.sub_district, addr.district, addr.division].filter(Boolean).join(', ')}</div>
                                                            <div className="text-xs text-gray-500">Type: {addr.address_type}</div>
                                                            {addr.is_default && (
                                                                <span className="inline-block mt-1 px-2 py-1 text-xs rounded bg-green-100 text-green-800">Default</span>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {!addr.is_default && (
                                                                <button
                                                                    onClick={() => handleSetDefault(addr.id)}
                                                                    className="px-3 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white text-sm"
                                                                >
                                                                    Set Default
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleEditAddress(addr)}
                                                                className="px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteAddress(addr)}
                                                                className="px-3 py-2 rounded-md border border-red-300 text-red-600 hover:bg-red-50 text-sm"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="md:col-span-1">
                                    <h2 className="text-xl font-bold text-gray-800 mb-4">{editingAddressId ? 'Edit Address' : 'Add Address'}</h2>
                                    <form onSubmit={handleAddressSubmit} className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                            <input
                                                type="text"
                                                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                value={addrFullName}
                                                onChange={(e) => setAddrFullName(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                            <input
                                                type="tel"
                                                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                value={addrPhone}
                                                onChange={(e) => setAddrPhone(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
                                            <select
                                                className="w-full border rounded-md px-3 py-2"
                                                value={addrDivision}
                                                onChange={(e) => {
                                                    setAddrDivision(e.target.value);
                                                    setAddrDistrict('');
                                                    setAddrSubDistrict('');
                                                }}
                                            >
                                                <option value="">Select Division</option>
                                                {Object.keys(BD_REGIONS).map(div => (
                                                    <option key={div} value={div}>{div}</option>
                                                ))}
                                                {addrDivision && !BD_REGIONS[addrDivision] && (
                                                    <option value={addrDivision}>{addrDivision}</option>
                                                )}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                                            <select
                                                className="w-full border rounded-md px-3 py-2"
                                                value={addrDistrict}
                                                onChange={(e) => {
                                                    setAddrDistrict(e.target.value);
                                                    setAddrSubDistrict('');
                                                }}
                                            >
                                                <option value="">Select District</option>
                                                {(BD_REGIONS[addrDivision]?.districts ? Object.keys(BD_REGIONS[addrDivision].districts) : []).map(d => (
                                                    <option key={d} value={d}>{d}</option>
                                                ))}
                                                {addrDistrict && !(BD_REGIONS[addrDivision]?.districts?.[addrDistrict]) && (
                                                    <option value={addrDistrict}>{addrDistrict}</option>
                                                )}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Sub District</label>
                                            <select
                                                className="w-full border rounded-md px-3 py-2"
                                                value={addrSubDistrict}
                                                onChange={(e) => setAddrSubDistrict(e.target.value)}
                                            >
                                                <option value="">Select Sub District</option>
                                                {(BD_REGIONS[addrDivision]?.districts?.[addrDistrict] || []).map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                                {addrSubDistrict && !(BD_REGIONS[addrDivision]?.districts?.[addrDistrict]?.includes(addrSubDistrict)) && (
                                                    <option value={addrSubDistrict}>{addrSubDistrict}</option>
                                                )}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                            <input
                                                type="text"
                                                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                value={addrAddress}
                                                onChange={(e) => setAddrAddress(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                            <select
                                                className="w-full border rounded-md px-3 py-2"
                                                value={addrType}
                                                onChange={(e) => setAddrType(e.target.value)}
                                            >
                                                <option>Home</option>
                                                <option>Office</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                id="addrDefault"
                                                type="checkbox"
                                                checked={addrDefault}
                                                onChange={(e) => setAddrDefault(e.target.checked)}
                                            />
                                            <label htmlFor="addrDefault" className="text-sm text-gray-700">Set as default address</label>
                                        </div>
                                        <div className="flex items-center gap-3 pt-2">
                                            <button
                                                type="submit"
                                                className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white"
                                            >
                                                {editingAddressId ? 'Update' : 'Add'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={resetAddressForm}
                                                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                                            >
                                                Reset
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
