// src/components/CategoryList.jsx
import React from 'react';
import { MdApps } from 'react-icons/md';

const categories = [
    "Smart Watches",
    "Smart Phones",
    "Headphones",
    "Smart TV & Accessories",
    "Computer & Accessories",
    "Wireless Speakers",
    "Security Cameras",
    "Smart Home Appliances",
    "Charger & Cables",
    "Powerbanks",
    "Network Components",
    "Health & Outdoors"
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
                    key={cat}
                    className="px-4 py-2 hover:bg-purple-50 cursor-pointer text-base"
                >
                    {cat}
                </li>
            ))}
        </ul>
    </div>
);

export default CategoryList;
