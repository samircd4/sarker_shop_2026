import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaUser, FaBoxOpen, FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';
import api from '../api/client';

const API_URL = import.meta.env.VITE_API_URL;

const Dashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState({ name: 'User', email: '' });
    const [activeTab, setActiveTab] = useState('dashboard');
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [ordersError, setOrdersError] = useState('');
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
                }
            })
            .catch(err => {
                console.error("Failed to fetch user profile:", err);
                // Optionally handle 401 by logging out
                if (err.response && err.response.status === 401) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    navigate('/account');
                }
            });
    }, [navigate]);

    useEffect(() => {
        if (activeTab !== 'orders') return;
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
                            <button className="w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-50 rounded">
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
                            {newOrder ? (
                                <div className="border rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="font-medium text-gray-900">New Order</div>
                                            <div className="text-sm text-gray-500">Just now</div>
                                        </div>
                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                            Pending
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <p>Total: {newOrder.total}</p>
                                        <p>Items: {newOrder.items_count}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    No recent orders found.
                                </div>
                            )}
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
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
