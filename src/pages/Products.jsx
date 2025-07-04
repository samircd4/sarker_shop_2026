import React, { useState, useEffect } from 'react'
import { FaStar, FaShoppingCart } from 'react-icons/fa'
import productsData from '../data/products.json'

const Products = () => {
    const [filteredProducts, setFilteredProducts] = useState([])
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [loading, setLoading] = useState(true)

    // Get unique categories
    const getUniqueCategories = (products) => {
        const categories = products.map(product => product.category)
        return ['All', ...new Set(categories)]
    }

    const categories = getUniqueCategories(productsData)

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => {
            setLoading(false)
        }, 1500)

        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        if (selectedCategory === 'All') {
            setFilteredProducts(productsData)
        } else {
            const filtered = productsData.filter(product => product.category === selectedCategory)
            setFilteredProducts(filtered)
        }
    }, [selectedCategory])

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Our Products</h1>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 cursor-pointer rounded-full text-sm font-medium transition-colors ${selectedCategory === category
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                    <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="relative">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-48 object-contain p-4 bg-gray-50"
                            />
                            <button className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors">
                                <FaShoppingCart size={16} />
                            </button>
                        </div>

                        <div className="p-4">
                            <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                                {product.name}
                            </h3>

                            <div className="flex items-center mb-2">
                                <div className="flex items-center">
                                    <FaStar className="text-yellow-400 mr-1" />
                                    <span className="text-sm text-gray-600">{product.rating}</span>
                                </div>
                                <span className="text-sm text-gray-500 ml-2">({product.reviews} reviews)</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-xl font-bold text-red-500">
                                    ${product.price}
                                </span>
                                <span className="text-sm text-gray-500">
                                    {product.category}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No products found in this category.</p>
                </div>
            )}
        </div>
    )
}

export default Products