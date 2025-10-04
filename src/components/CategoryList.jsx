// src/components/CategoryList.jsx
import React from 'react';
import { MdApps } from 'react-icons/md';

const categories = [
    { name: "Smart Watches", icon: "⌚" },
    { name: "Smart Phones", icon: "📱" },
    { name: "Headphones", icon: "🎧" },
    { name: "Mobile Accessories", icon: "💻" },
    { name: "Wireless Speakers", icon: "🔊" },
    { name: "Smart Home Appliances", icon: "🏠" },
    { name: "Charger & Cables", icon: "🔌" },
    { name: "Powerbanks", icon: "🔋" },
];

const CategoryList = () => (
    <div className="w-full md:w-60 bg-white rounded-lg shadow">
        <div className="flex items-center gap-2 bg-purple-600 text-white font-bold px-4 py-3 rounded-t-lg text-lg">
            <MdApps className="text-xl" />
            <span>All Categories</span>
        </div>
        <ul>
            {categories.map(cat => (
                <li
                    key={cat.name}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-purple-100 cursor-pointer text-base"
                >
                    <span className="text-lg">{cat.icon}</span>
                    {cat.name}
                </li>
            ))}
            <li>
                <button className='hidden sm:block w-full text-center p-2 bg-purple-600 text-white font-bold rounded cursor-pointer py-3'>More</button>
            </li>
        </ul>
    </div>
);

export default CategoryList;
