import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGoogle, FaFacebook, FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import { useCart } from '../context/CartContext.jsx';
import { toast } from 'react-toastify';
import api from '../api/client';
import { useGoogleLogin } from '@react-oauth/google';
import FacebookLogin from 'react-facebook-login-lite';

const API_URL = import.meta.env.VITE_API_URL;
const FB_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID;

const Account = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { syncLocalCartToServer } = useCart();

    // Form states
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLoading(true);
            try {
                const res = await axios.post(`${API_URL}/auth/google/`, {
                    access_token: tokenResponse.access_token
                });
                localStorage.setItem('access_token', res.data.access_token || res.data.access);
                localStorage.setItem('refresh_token', res.data.refresh_token || res.data.refresh);

                await syncLocalCartToServer();
                toast.success("Logged in with Google!");
                navigate('/dashboard');
            } catch (err) {
                console.error("Google login error details:", err.response?.data || err.message);
                const errorMsg = err.response?.data?.non_field_errors?.[0] ||
                    err.response?.data?.detail ||
                    "Google login failed. Please try again.";
                toast.error(errorMsg);
            } finally {
                setLoading(false);
            }
        },
        onError: () => toast.error("Google login permission denied"),
    });

    const handleFacebookResponse = async (response) => {
        if (response.authResponse) {
            setLoading(true);
            try {
                const res = await axios.post(`${API_URL}/auth/facebook/`, {
                    access_token: response.authResponse.accessToken
                });
                localStorage.setItem('access_token', res.data.access_token || res.data.access);
                localStorage.setItem('refresh_token', res.data.refresh_token || res.data.refresh);

                await syncLocalCartToServer();
                toast.success("Logged in with Facebook!");
                navigate('/dashboard');
            } catch (err) {
                console.error("Facebook login error:", err);
                toast.error("Facebook login failed. Please try again.");
            } finally {
                setLoading(false);
            }
        }
    };

    const toggleMode = () => setIsLogin(!isLogin);

    // Redirect authenticated users away from Account page
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        api.get('/customers/me/').then(() => {
            navigate('/dashboard');
        }).catch(() => {
            // stay on account page if token invalid/expired
        });
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                // Login Logic
                const response = await axios.post(`${API_URL}/auth/login/`, {
                    email,
                    password
                });

                // Assuming backend returns access/refresh tokens
                localStorage.setItem('access_token', response.data.access);
                localStorage.setItem('refresh_token', response.data.refresh);

                await syncLocalCartToServer();
                toast.success("Logged in successfully!");
                navigate('/'); // Redirect to home or previous page
            } else {
                // Register Logic
                await axios.post(`${API_URL}/auth/register/`, {
                    full_name: name,
                    email,
                    phone_number: phone,
                    password
                });

                toast.success("Account created successfully! Please log in.");
                setIsLogin(true); // Switch to login mode
            }
        } catch (error) {
            console.error("Auth error:", error);
            const msg = error.response?.data?.email?.[0] ||
                error.response?.data?.detail ||
                JSON.stringify(error.response?.data) ||
                "Authentication failed";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {isLogin ? 'Sign in to your account' : 'Create a new account'}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Or{' '}
                        <button
                            onClick={toggleMode}
                            className="font-medium text-purple-600 hover:text-purple-500 focus:outline-none underline"
                        >
                            {isLogin ? 'create a new account' : 'sign in to existing account'}
                        </button>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <input type="hidden" name="remember" defaultValue="true" />
                    <div className="rounded-md shadow-sm -space-y-px">
                        {!isLogin && (
                            <>
                                <div>
                                    <label htmlFor="name" className="sr-only">Full Name</label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                                        placeholder="Full Name"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="phone" className="sr-only">Phone Number</label>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        required
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                                        placeholder="Phone Number"
                                    />
                                </div>
                            </>
                        )}
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email address</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${isLogin ? 'rounded-t-md' : ''} focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm`}
                                placeholder="Email address"
                            />
                        </div>
                        <div className="relative">
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword((s) => !s)}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20 text-gray-500 hover:text-gray-700 focus:outline-none"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                Remember me
                            </label>
                        </div>

                        {isLogin && (
                            <div className="text-sm">
                                <a href="#" className="font-medium text-purple-600 hover:text-purple-500">
                                    Forgot your password?
                                </a>
                            </div>
                        )}
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-70"
                        >
                            {loading ? 'Processing...' : (isLogin ? 'Sign in' : 'Sign up')}
                        </button>
                    </div>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <div>
                                <button
                                    type="button"
                                    onClick={() => googleLogin()}
                                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                                >
                                    <FaGoogle className="h-5 w-5 text-red-500" />
                                    <span className="ml-2">Google</span>
                                </button>
                            </div>

                            <div className="relative">
                                <FacebookLogin
                                    appId={FB_APP_ID}
                                    onSuccess={handleFacebookResponse}
                                    onFailure={() => toast.error("Facebook login failed")}
                                    render={(renderProps) => (
                                        <button
                                            type="button"
                                            onClick={renderProps.onClick}
                                            className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                                        >
                                            <FaFacebook className="h-5 w-5 text-blue-600" />
                                            <span className="ml-2">Facebook</span>
                                        </button>
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Account;
