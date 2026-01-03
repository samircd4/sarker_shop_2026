import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaUser, FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';
import api from '../api/client';
import { toast } from 'react-toastify';
import RecentOrder from '../components/dashboard/RecentOrder';
import MyOrders from '../components/dashboard/MyOrders';
import Addresses from '../components/dashboard/Addresses';
import ProfileSettings from '../components/dashboard/ProfileSettings';

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
                        <RecentOrder
                            orders={orders}
                            ordersLoading={ordersLoading}
                            ordersError={ordersError}
                            formatDate={formatDate}
                            statusChipClass={statusChipClass}
                            paymentChipClass={paymentChipClass}
                            getPaymentStatus={getPaymentStatus}
                            getTransactionId={getTransactionId}
                            getPaymentMethod={getPaymentMethod}
                            formatAddress={formatAddress}
                            downloadInvoice={downloadInvoice}
                            sortOrdersDesc={sortOrdersDesc}
                        />
                    )}

                    {activeTab === 'orders' && (
                        <MyOrders
                            orders={orders}
                            ordersLoading={ordersLoading}
                            ordersError={ordersError}
                            formatDate={formatDate}
                            statusChipClass={statusChipClass}
                            paymentChipClass={paymentChipClass}
                            getPaymentStatus={getPaymentStatus}
                            getTransactionId={getTransactionId}
                            getPaymentMethod={getPaymentMethod}
                            formatAddress={formatAddress}
                            downloadInvoice={downloadInvoice}
                        />
                    )}

                    {activeTab === 'profile' && (
                        <ProfileSettings
                            user={user}
                            profileName={profileName}
                            setProfileName={setProfileName}
                            profileEmail={profileEmail}
                            setProfileEmail={setProfileEmail}
                            profilePhone={profilePhone}
                            setProfilePhone={setProfilePhone}
                            profileImagePreview={profileImagePreview}
                            onProfileImageChange={onProfileImageChange}
                            onProfileSave={onProfileSave}
                            savingProfile={savingProfile}
                        />
                    )}

                    {activeTab === 'address' && (
                        <Addresses
                            addresses={addresses}
                            addressesLoading={addressesLoading}
                            addressesError={addressesError}
                            BD_REGIONS={BD_REGIONS}
                            addrFullName={addrFullName}
                            setAddrFullName={setAddrFullName}
                            addrPhone={addrPhone}
                            setAddrPhone={setAddrPhone}
                            addrAddress={addrAddress}
                            setAddrAddress={setAddrAddress}
                            addrDivision={addrDivision}
                            setAddrDivision={setAddrDivision}
                            addrDistrict={addrDistrict}
                            setAddrDistrict={setAddrDistrict}
                            addrSubDistrict={addrSubDistrict}
                            setAddrSubDistrict={setAddrSubDistrict}
                            addrType={addrType}
                            setAddrType={setAddrType}
                            addrDefault={addrDefault}
                            setAddrDefault={setAddrDefault}
                            editingAddressId={editingAddressId}
                            handleAddressSubmit={handleAddressSubmit}
                            resetAddressForm={resetAddressForm}
                            handleEditAddress={handleEditAddress}
                            handleDeleteAddress={handleDeleteAddress}
                            handleSetDefault={handleSetDefault}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
