// src/pages/Home.jsx
import React from 'react';
import CategoryList from '../components/CategoryList';
import HeroSection from '../components/HeroSection';

// New Components
import FeaturedProducts from '../components/FeaturedProducts';
import BestSellers from '../components/BestSellers';
import PromoBanner from '../components/PromoBanner';
import Newsletter from '../components/Newsletter';

const Home = () => (
  <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4 md:gap-6 py-4 md:py-8 px-2">
    {/* Category Sidebar (desktop/tablet only) */}
    <div className="w-full md:w-60 mb-2 md:mb-0 hidden md:block">
      <CategoryList />
    </div>

    {/* Main Content */}
    <div className="flex-1 flex flex-col gap-8">
      {/* Hero Section */}
      <HeroSection />

      {/* Promotional Banner */}
      <PromoBanner />

      {/* Featured Products */}
      <section>
        <h2 className="text-xl md:text-2xl font-semibold mb-4">Featured Products</h2>
        <FeaturedProducts />
      </section>

      {/* Best Sellers */}
      <section>
        <h2 className="text-xl md:text-2xl font-semibold mb-4">Best Sellers</h2>
        <BestSellers />
      </section>

      {/* Newsletter Signup */}
      <Newsletter />
    </div>
  </div>
);

export default Home;

