import React, { useState, useEffect } from 'react'
import Product from '../components/Product'
import { MdFilterList, MdApps } from 'react-icons/md'
import CategoryCarousel from '../components/CategoryCarousel.jsx'
import FilterPanel from '../components/FilterPanel.jsx'
import CategoryPanel from '../components/CategoryPanel.jsx'
// import axios from 'axios'
import api, { BASE_URL } from '../api/client'
import localProducts from '../data/products.json'


const API_URL = import.meta.env.VITE_API_URL

const fixImage = (img) => {
    if (!img) return ''
    if (typeof img === 'string' && img.startsWith('http')) return img
    return `${BASE_URL}${img}`
}



const Products = () => {
    const [products, setProducts] = useState([])
    const [filteredProducts, setFilteredProducts] = useState([])
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [loading, setLoading] = useState(true)
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [isCategoryOpen, setIsCategoryOpen] = useState(false)
    const [priceMin, setPriceMin] = useState(0)
    const [priceMax, setPriceMax] = useState(0)
    const [globalMin, setGlobalMin] = useState(0)
    const [globalMax, setGlobalMax] = useState(0)
    const [minRating, setMinRating] = useState(0)
    const [featuredOnly, setFeaturedOnly] = useState(false)
    const [selectedBrands, setSelectedBrands] = useState([])
    const [categories, setCategories] = useState([{ name: 'All', logo: null }])

    const getCategoryName = (p) => {
        if (!p) return ''
        const c = p.category
        return typeof c === 'string' ? c : (c?.name || '')
    }

    const getBrandName = (p) => {
        if (!p) return ''
        const b = p.brand
        return typeof b === 'string' ? b : (b?.name || '')
    }



    useEffect(() => {
        // Helpful debug log
        console.log('API_URL', API_URL)

        const fetchProducts = async () => {
            try {
                const response = await api.get('/products/')
                let list = []
                if (Array.isArray(response.data)) {
                    list = response.data
                } else if (response.data && Array.isArray(response.data.results)) {
                    list = response.data.results
                }
                const mapped = list.map(p => ({
                    ...p,
                    image: fixImage(p.image)
                }))
                setProducts(mapped)
                setFilteredProducts(mapped)
            } catch (error) {
                console.error('Products API error:', error)
                // Fallback to bundled local data so UI still shows products during development
                if (Array.isArray(localProducts) && localProducts.length > 0) {
                    const mappedLocal = localProducts.map(p => ({
                        ...p,
                        reviews_count: p.reviews,
                    }))
                    setProducts(mappedLocal)
                    setFilteredProducts(mappedLocal)
                }
                setLoading(false)
            }
        }

        fetchProducts()
    }, [])


    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/categories/')
                const data = Array.isArray(response.data) ? response.data : (response.data?.results || [])
                const apiCategories = data.map(c => ({
                    name: c.name,
                    logo: fixImage(c.logo),
                    id: c.id,
                    slug: c.slug
                }))
                const uniqueApiCategories = apiCategories.filter((c, index, self) =>
                    index === self.findIndex((t) => t.name === c.name)
                )
                setCategories([{ name: 'All', logo: null }, ...uniqueApiCategories])
            } catch (error) {
                console.error('Categories API error:', error)
                // Fallback to local data if API fails
                const localNames = [...new Set(products.map(p => getCategoryName(p)).filter(Boolean))]
                const localCats = localNames.map(name => ({ name, logo: null }))
                setCategories([{ name: 'All', logo: null }, ...localCats])
            }
        }
        fetchCategories()
    }, [products])




    const brands = Array.from(new Set((Array.isArray(products) ? products : []).map(p => getBrandName(p)).filter((s) => typeof s === 'string' && s.trim().length > 0)))


    // Category images come from the categories API (`logo` or similar field)

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => {
            setLoading(false)
        }, 500)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        if (products.length > 0) {
            const prices = products.map(p => Number(p.price) || 0)
            const gMin = Math.floor(Math.min(...prices))
            const gMax = Math.ceil(Math.max(...prices))
            setGlobalMin(gMin)
            setGlobalMax(gMax)
            setPriceMin(gMin)
            setPriceMax(gMax)
        }
    }, [products])

    useEffect(() => {
        let base = selectedCategory === 'All'
            ? products
            : products.filter(product => getCategoryName(product) === selectedCategory)

        // Apply price range
        base = base.filter(p => {
            const price = Number(p.price) || 0
            return price >= priceMin && price <= priceMax
        })

        // Apply rating
        base = base.filter(p => (p.rating ?? 0) >= minRating)

        // Apply featured
        if (featuredOnly) {
            base = base.filter(p => p.is_featured)
        }

        // Apply brand if available
        if (selectedBrands.length > 0) {
            base = base.filter(p => selectedBrands.includes(getBrandName(p)))
        }

        setFilteredProducts(base)
    }, [selectedCategory, priceMin, priceMax, minRating, featuredOnly, selectedBrands, products])

    const handleToggleBrand = (brand, checked) => {
        if (checked) {
            setSelectedBrands(prev => prev.includes(brand) ? prev : [...prev, brand])
        } else {
            setSelectedBrands(prev => prev.filter(x => x !== brand))
        }
    }
    const handleClearAll = () => {
        setPriceMin(globalMin)
        setPriceMax(globalMax)
        setMinRating(0)
        setFeaturedOnly(false)
        setSelectedBrands([])
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        )
    }







    return (
        <div className="w-[95%] sm:w-[90%] max-w-6xl mx-auto">
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-3xl font-bold text-gray-800">Our Products</h1>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsCategoryOpen(true)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                            aria-label="Open categories panel"
                        >
                            <MdApps className="w-5 h-5 text-purple-600" />
                            <span className="hidden sm:inline">Categories</span>
                        </button>
                        <button
                            onClick={() => setIsFilterOpen(true)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                            aria-label="Open filters"
                        >
                            <MdFilterList className="w-5 h-5" />
                            <span className="hidden sm:inline">Filters</span>
                        </button>
                    </div>
                </div>

                <CategoryCarousel
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                />

                <FilterPanel
                    open={isFilterOpen}
                    onClose={() => setIsFilterOpen(false)}
                    priceMin={priceMin}
                    priceMax={priceMax}
                    globalMin={globalMin}
                    globalMax={globalMax}
                    onChangePriceMin={(v) => setPriceMin(v)}
                    onChangePriceMax={(v) => setPriceMax(v)}
                    minRating={minRating}
                    onChangeMinRating={(v) => setMinRating(v)}
                    featuredOnly={featuredOnly}
                    onChangeFeaturedOnly={(v) => setFeaturedOnly(v)}
                    brands={brands}
                    selectedBrands={selectedBrands}
                    onToggleBrand={handleToggleBrand}
                    onClearAll={handleClearAll}
                />

                <CategoryPanel
                    open={isCategoryOpen}
                    onClose={() => setIsCategoryOpen(false)}
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                />
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3 lg:gap-4">
                {filteredProducts.map((product) => (
                    <Product key={product.id} product={product} />
                ))}
            </div>


            {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No products found in this category.</p>
                </div>
            )}
            {__styles}
        </div>
    )
}

export default Products
const __styles = (
    <style>{`
        @keyframes slide-in-right {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
        }
        .animate-slide-in-right {
            animation: slide-in-right 0.3s cubic-bezier(0.4,0,0.2,1) both;
        }
        @keyframes slide-out-right {
            from { transform: translateX(0); }
            to { transform: translateX(100%); }
        }
        .animate-slide-out-right {
            animation: slide-out-right 0.3s cubic-bezier(0.4,0,0.2,1) both;
        }
    `}</style>
)
