import React from 'react'
import { FaCaretDown } from 'react-icons/fa'
import { IoCartOutline } from 'react-icons/io5'
import { Link, NavLink } from 'react-router-dom'
// import { useCart } from '../context/CartContext'

const Navbar = () => {
    const location = false;
    const cartItem = 8;

    return (
        <div className='bg-white shadow-lg p-3 sm:p-4'>
            <div className="max-w-6xl mx-auto flex justify-between items-center">
                {/* Brand and Menu section */}
                <div className="flex gap-7 items-center">
                    <Link to={'/'} className="text-2xl font-bold">
                        <span className="text-red-500">Sarker</span>
                        <span className="text-gray-700"> Shop</span>
                    </Link>
                
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
                    {/* <div className='hidden md:block'>
                        <SignedOut>
                            <SignInButton className="bg-red-500 text-white px-3 py-1 rounded-md cursor-pointer"/>
                        </SignedOut>
                        <SignedIn>
                            <UserButton />
                        </SignedIn>
                    </div> */}
                </nav>
            </div>
        </div>
    )
}

export default Navbar