// src/components/HeroSection.jsx
import React from 'react';

const HeroSection = () => (
    <div className="bg-gradient-to-r from-purple-100 to-white rounded-lg shadow p-8 h-full flex flex-col justify-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Sarker Shop</h1>
        <p className="text-lg text-gray-600 mb-6">Find the best electronics and accessories here!</p>
        {/* You can add a hero image or button here */}
    </div>
);

export default HeroSection;
