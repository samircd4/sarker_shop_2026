import React, { useState } from 'react';
import { FaCaretDown } from 'react-icons/fa'
import { IoCartOutline } from 'react-icons/io5'
import { Link, NavLink } from 'react-router-dom'
import { FiMenu } from 'react-icons/fi';
import CategoryList from './CategoryList';
import SearchBar from './SearchBar';
// import { useCart } from '../context/CartContext'

const Navbar = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false); // NEW
    const cartItem = 8;

    return (
        <>
            <div className='bg-white shadow-lg p-3 sm:p-4'>
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
                            <span className="text-red-500">Sarker</span>
                            <span className="text-gray-700"> Shop</span>
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
                            <NavLink to={'/'} className={({ isActive }) => `${isActive ? "border-b-3 transition-all border-red-500" : "text-black"} cursor-pointer`}><li>Home</li></NavLink>
                            <NavLink to={"/products"} className={({ isActive }) => `${isActive ? "border-b-3 transition-all border-red-500" : "text-black"} cursor-pointer`}><li>Products</li></NavLink>
                            <NavLink to={"/about"} className={({ isActive }) => `${isActive ? "border-b-3 transition-all border-red-500" : "text-black"} cursor-pointer`}><li>About</li></NavLink>
                        </ul>
                        <Link to={'/cart'} className='relative'>
                            <IoCartOutline className='h-7 w-7' />
                            <span className='bg-red-500 px-2 rounded-full absolute -top-3 -right-3 text-white'>{cartItem}</span>
                        </Link>
                    </nav>
                </div>
            </div>
            {/* Side Drawer for Categories */}
            {drawerOpen && (
                <div className="fixed inset-0 z-50 flex">
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-30"
                        onClick={() => setDrawerOpen(false)}
                    />
                    {/* Drawer */}
                    <div className="relative bg-white w-64 h-full shadow-lg z-50 animate-slide-in-left">
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
                `}
            </style>
        </>
    )
}

export default Navbar;