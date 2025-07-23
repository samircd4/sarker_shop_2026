// src/pages/Home.jsx
import React from 'react';
import CategoryList from '../components/CategoryList';
import HeroSection from '../components/HeroSection';

const Home = () => (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4 md:gap-6 py-4 md:py-8 px-2">
        {/* Category Sidebar (desktop/tablet only) */}
        <div className="w-full md:w-60 mb-2 md:mb-0 hidden md:block">
            <CategoryList />
        </div>
        {/* Hero Content */}
        <div className="flex-1">
            <HeroSection />
        </div>
    </div>
);

export default Home;
