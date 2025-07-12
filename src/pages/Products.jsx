import React, { useState, useEffect } from 'react'
import Product from '../components/Product'
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
        }, 500)

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
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                    <Product key={product.id} product={product} />
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