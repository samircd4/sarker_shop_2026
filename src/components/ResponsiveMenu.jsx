// import { UserButton, useUser } from '@clerk/clerk-react'
import React from 'react'
import { FaUserCircle, FaHome, FaInfoCircle, FaPhone, FaShoppingBag } from 'react-icons/fa'
import { Link, useLocation } from 'react-router-dom'

const ResponsiveMenu = () => {
    // const { user } = useUser()
    const location = useLocation()

    const menuItems = [
        { path: '/', label: 'Home', icon: FaHome },
        { path: '/products', label: 'Products', icon: FaShoppingBag },
        { path: '/about', label: 'About', icon: FaInfoCircle },
        { path: '/contact', label: 'Contact', icon: FaPhone },
    ]

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden">
            <div className="flex justify-around items-center py-4">
                {menuItems.map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.path

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors ${isActive
                                    ? 'text-purple-500 bg-purple-50'
                                    : 'text-neutral-600 hover:text-primary-500'
                                }`}
                        >
                            <Icon size={20} />
                            <span className="text-xs mt-1 font-medium">{item.label}</span>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}

export default ResponsiveMenu