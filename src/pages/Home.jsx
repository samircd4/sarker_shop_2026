// pages/Home.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaShoppingCart, FaArrowRight, FaTruck, FaShieldAlt, FaHeadset, FaCreditCard } from 'react-icons/fa';
import { IoFlashOutline } from 'react-icons/io5';
import Product from "../components/Product";

const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);

    // Hero banner data
    const heroSlides = [
        {
            title: "Welcome to Sarker Shop",
            subtitle: "Discover Amazing Products at Great Prices",
            description: "Shop the latest electronics, accessories, and home essentials with unbeatable deals.",
            image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop",
            cta: "Shop Now"
        },
        {
            title: "New Arrivals",
            subtitle: "Fresh Products Every Week",
            description: "Be the first to get your hands on our newest collection of premium products.",
            image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=600&fit=crop",
            cta: "Explore"
        },
        {
            title: "Special Offers",
            subtitle: "Up to 50% Off Selected Items",
            description: "Don't miss out on our limited-time offers and exclusive discounts.",
            image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200&h=600&fit=crop",
            cta: "View Deals"
        }
    ];

    // Load featured products
    useEffect(() => {
        fetch('/src/data/products.json')
            .then(response => response.json())
            .then(data => {
                // Get 6 featured products (first 6 from the data)
                setFeaturedProducts(data.slice(0, 6));
            })
            .catch(error => console.error('Error loading products:', error));
    }, []);

    // Auto-rotate hero slides
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [heroSlides.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[500px] md:h-[600px] overflow-hidden">
                {heroSlides.map((slide, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                            }`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-10"></div>
                        <img
                            src={slide.image}
                            alt={slide.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 z-20 flex items-center">
                            <div className="container mx-auto px-4 md:px-8">
                                <div className="max-w-2xl text-white">
                                    <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
                                        {slide.title}
                                    </h1>
                                    <h2 className="text-xl md:text-2xl font-semibold mb-4 text-red-300">
                                        {slide.subtitle}
                                    </h2>
                                    <p className="text-lg mb-8 text-gray-200">
                                        {slide.description}
                                    </p>
                                    <Link
                                        to="/products"
                                        className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                                    >
                                        {slide.cta}
                                        <FaArrowRight className="ml-2" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Slide Navigation */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
                    {heroSlides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? 'bg-red-500' : 'bg-white/50'
                                }`}
                        />
                    ))}
                </div>

                {/* Arrow Navigation */}
                <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all"
                >
                    <FaArrowRight className="rotate-180" />
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all"
                >
                    <FaArrowRight />
                </button>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4 md:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaTruck className="text-red-600 text-2xl" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Free Shipping</h3>
                            <p className="text-gray-600">Free delivery on orders over $50</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaShieldAlt className="text-red-600 text-2xl" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Secure Payment</h3>
                            <p className="text-gray-600">100% secure payment processing</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaHeadset className="text-red-600 text-2xl" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
                            <p className="text-gray-600">Round the clock customer support</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaCreditCard className="text-red-600 text-2xl" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Easy Returns</h3>
                            <p className="text-gray-600">30-day money back guarantee</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products Section */}
            <section className="py-16">
                <div className="container mx-auto px-4 md:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Products</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Discover our handpicked selection of premium products that combine quality, style, and functionality.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {featuredProducts.map((product) => (
                            <Product key={product.id} product={product} />
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Link
                            to="/products"
                            className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                        >
                            View All Products
                            <FaArrowRight className="ml-2" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4 md:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop by Category</h2>
                        <p className="text-gray-600">Explore our diverse range of products</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { name: 'Electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop', count: '50+ Products' },
                            { name: 'Accessories', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop', count: '30+ Products' },
                            { name: 'Home & Living', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop', count: '40+ Products' },
                            { name: 'Office Supplies', image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop', count: '25+ Products' }
                        ].map((category, index) => (
                            <div key={index} className="group relative overflow-hidden rounded-lg shadow-lg cursor-pointer">
                                <img
                                    src={category.image}
                                    alt={category.name}
                                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                                <div className="absolute bottom-4 left-4 text-white">
                                    <h3 className="text-xl font-semibold mb-1">{category.name}</h3>
                                    <p className="text-sm text-gray-200">{category.count}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="py-16 bg-red-600">
                <div className="container mx-auto px-4 md:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Stay Updated</h2>
                    <p className="text-red-100 mb-8 max-w-2xl mx-auto">
                        Subscribe to our newsletter for exclusive offers, new product announcements, and special discounts.
                    </p>
                    <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
                        />
                        <button className="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                            Subscribe
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
