import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaUser, FaBoxOpen, FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const Dashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState({ name: 'User', email: '' });

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
                            <button className="w-full text-left px-3 py-2 bg-purple-50 text-purple-700 font-medium rounded">
                                Dashboard
                            </button>
                            <button className="w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-50 rounded">
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
                    {/* Recent Orders Section */}
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
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
