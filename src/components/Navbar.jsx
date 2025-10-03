import React, { useState, useEffect } from 'react';
import { FaCaretDown } from 'react-icons/fa'
import { IoCartOutline } from 'react-icons/io5'
import { Link, NavLink } from 'react-router-dom'
import { FiMenu } from 'react-icons/fi';
import CategoryList from './CategoryList';
import SearchBar from './SearchBar';
import { useCart } from '../context/CartContext'
import CartPanel from './CartPanel'

const Navbar = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [showDrawer, setShowDrawer] = useState(false); // New state for controlling drawer visibility
    const [animationClass, setAnimationClass] = useState(''); // New state for animation class
    const [searchFocused, setSearchFocused] = useState(false); // NEW
    const [cartOpen, setCartOpen] = useState(false);
    const { cartItem } = useCart();
    const totalCount = cartItem.reduce((sum, item) => sum + (item.quantity || 0), 0);

    useEffect(() => {
        if (drawerOpen) {
            setShowDrawer(true);
            setAnimationClass('animate-slide-in-left');
        } else {
            setAnimationClass('animate-slide-out-left');
            const timer = setTimeout(() => {
                setShowDrawer(false);
            }, 300); // Duration of slide-out animation
            return () => clearTimeout(timer);
        }
    }, [drawerOpen]);

    return (
        <>
            <div className='bg-white shadow-lg p-3 sm:p-4 fixed top-0 left-0 right-0 z-40'>
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    {/* Hamburger for mobile */}
                    <button
                        className="md:hidden mr-2"
                        onClick={() => setDrawerOpen(true)}
                        aria-label="Open categories"
                    >
                        <FiMenu className="text-2xl text-gray-700" />
                    </button>
                    {/* Brand and Menu section */}
                    <div
                        className={`
                            flex items-center
                            overflow-hidden transition-all duration-300
                            ${searchFocused ? 'w-0 opacity-0 mr-0' : 'w-auto opacity-100 mr-4'}
                            md:w-auto md:opacity-100 md:mr-4
                        `}
                        style={{ minWidth: searchFocused ? 0 : undefined }}
                    >
                        <Link
                            to={'/'}
                            className="text-2xl font-bold whitespace-nowrap"
                        >
                            <span className="text-purple-600">Sarker</span>
                            <span className="text-neutral-700"> Shop</span>
                        </Link>
                    </div>
                    {/* SearchBar */}
                    <div className="flex-1 flex justify-center transition-all duration-300">
                        <SearchBar
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => setSearchFocused(false)}
                        />
                    </div>
                    {/* Menu section */}
                    <nav className='flex gap-7 items-center p-1'>
                        <ul className='md:flex gap-7 items-center text-xl font-semibold hidden'>
                            <NavLink to={'/'} className={({ isActive }) => `${isActive ? "border-b-3 transition-all border-primary-500 text-purple-600" : "text-neutral-900"} cursor-pointer`}><li>Home</li></NavLink>
                            <NavLink to={"/products"} className={({ isActive }) => `${isActive ? "border-b-3 transition-all border-primary-500 text-purple-600" : "text-neutral-900"} cursor-pointer`}><li>Products</li></NavLink>
                            <NavLink to={'/about'} className={({ isActive }) => `${isActive ? "border-b-3 transition-all border-primary-500 text-purple-600" : "text-neutral-900"} cursor-pointer`}><li>About</li></NavLink>
                        </ul>
                        <button className='relative' onClick={() => setCartOpen(true)} aria-label="Open cart">
                            <IoCartOutline className='h-7 w-7' />
                            <span className='bg-purple-600 px-2 rounded-full absolute -top-3 -right-3 text-white'>{totalCount}</span>
                        </button>
                        
                    </nav>
                </div>
            </div>
            {/* Cart Panel */}
            <CartPanel open={cartOpen} onClose={() => setCartOpen(false)} />
            {/* Side Drawer for Categories */}
            {showDrawer && (
                <div className="fixed inset-0 z-50 flex" onClick={() => setDrawerOpen(false)}>
                    {/* Drawer */}
                    <div className={`relative bg-white w-64 h-full shadow-lg z-50 ${animationClass}`} onClick={(e) => e.stopPropagation()}>
                        <button
                            className="absolute top-3 right-3 text-2xl"
                            onClick={() => setDrawerOpen(false)}
                            aria-label="Close categories"
                        >
                            &times;
                        </button>
                        <CategoryList />
                    </div>
                </div>
            )}
            {/* Add this animation to your CSS or Tailwind config */}
            <style>
                {`
                @keyframes slide-in-left {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(0); }
                }
                .animate-slide-in-left {
                    animation: slide-in-left 0.3s cubic-bezier(0.4,0,0.2,1) both;
                }
                @keyframes slide-out-left {
                    from { transform: translateX(0); }
                    to { transform: translateX(-100%); }
                }
                .animate-slide-out-left {
                    animation: slide-out-left 0.3s cubic-bezier(0.4,0,0.2,1) both;
                }
                `}
            </style>
        </>
    )
}

export default Navbar;