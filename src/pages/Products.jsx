import React, { useState, useEffect, useRef } from 'react'
import Product from '../components/Product'
import { MdDevices, MdSettings, MdHome, MdWork, MdApps, MdFilterList } from 'react-icons/md'
import axios from 'axios'


const API_URL = import.meta.env.VITE_API_URL



const Products = () => {
    const [products, setProducts] = useState([])
    const [filteredProducts, setFilteredProducts] = useState([])
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [loading, setLoading] = useState(true)
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [showFilterPanel, setShowFilterPanel] = useState(false)
    const [filterAnimationClass, setFilterAnimationClass] = useState('')
    const [isCategoryOpen, setIsCategoryOpen] = useState(false)
    const [showCategoryPanel, setShowCategoryPanel] = useState(false)
    const [categoryAnimationClass, setCategoryAnimationClass] = useState('')
    const [priceMin, setPriceMin] = useState(0)
    const [priceMax, setPriceMax] = useState(0)
    const [globalMin, setGlobalMin] = useState(0)
    const [globalMax, setGlobalMax] = useState(0)
    const [minRating, setMinRating] = useState(0)
    const [featuredOnly, setFeaturedOnly] = useState(false)
    const [selectedBrands, setSelectedBrands] = useState([])
    const carouselRef = useRef(null)
    const isDragging = useRef(false)
    const startX = useRef(0)
    const scrollStart = useRef(0)
    const [categories, setCategories] = useState(['All'])

    const getCategoryName = (p) => {
        if (!p) return ''
        const c = p.category
        return typeof c === 'string' ? c : (c?.name || '')
    }

    

    useEffect(() => {
        axios.get(`${API_URL}/products/`).then(response => {
            const list = Array.isArray(response.data) ? response.data : []
            setProducts(list)
            setFilteredProducts(list)
        }).catch(error => {
            console.error(error)
        })
    }, [])


    useEffect(() => {
        axios.get(`${API_URL}/categories/`).then(response => {
            const uniqueCategories = ['All', ...new Set((Array.isArray(response.data) ? response.data : []).map(c => c.name))]
            setCategories(uniqueCategories)
        }).catch(error => {
            console.error('API Error:', error)
            // Fallback to local data if API fails
            const localCategories = ['All', ...new Set(products.map(p => getCategoryName(p)).filter(Boolean))]
            setCategories(localCategories)
        })
    }, [products])


    
    
    const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)))

    const categoryIconMap = {
        Electronics: MdDevices,
        Accessories: MdSettings,
        Home: MdHome,
        Office: MdWork,
        All: MdApps,
    }

    const getCategoryImage = (category) => {
        if (category === 'All') return null
        const item = products.find(p => getCategoryName(p) === category)
        return item?.image || null
    }

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

    // Handle right-side category panel mount/unmount with slide animations
    useEffect(() => {
        if (isCategoryOpen) {
            setShowCategoryPanel(true)
            setCategoryAnimationClass('animate-slide-in-right')
        } else {
            setCategoryAnimationClass('animate-slide-out-right')
            const t = setTimeout(() => setShowCategoryPanel(false), 300)
            return () => clearTimeout(t)
        }
    }, [isCategoryOpen])

    // Handle right-side filter panel animations and mount lifecycle
    useEffect(() => {
        if (isFilterOpen) {
            setShowFilterPanel(true)
            setFilterAnimationClass('animate-slide-in-right')
        } else {
            setFilterAnimationClass('animate-slide-out-right')
            const t = setTimeout(() => setShowFilterPanel(false), 300)
            return () => clearTimeout(t)
        }
    }, [isFilterOpen])

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
            base = base.filter(p => selectedBrands.includes(p.brand))
        }

        setFilteredProducts(base)
    }, [selectedCategory, priceMin, priceMax, minRating, featuredOnly, selectedBrands, products])

    const onPointerDown = (e) => {
        const container = carouselRef.current
        if (!container) return
        isDragging.current = true
        startX.current = e.clientX || (e.touches && e.touches[0]?.clientX) || 0
        scrollStart.current = container.scrollLeft
    }

    const onPointerMove = (e) => {
        if (!isDragging.current) return
        e.preventDefault()
        const container = carouselRef.current
        if (!container) return
        const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0
        const delta = (startX.current - clientX)
        container.scrollLeft = scrollStart.current + delta
    }

    const onPointerUp = () => {
        isDragging.current = false
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

                {/* Category Carousel: rectangular tiles with purple border, swipe to navigate */}
                <div className="mb-6">
                    <div
                        ref={carouselRef}
                        onMouseDown={onPointerDown}
                        onMouseMove={onPointerMove}
                        onMouseUp={onPointerUp}
                        onMouseLeave={onPointerUp}
                        onTouchStart={onPointerDown}
                        onTouchMove={onPointerMove}
                        onTouchEnd={onPointerUp}
                        className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory px-1 select-none cursor-grab active:cursor-grabbing"
                        style={{ scrollBehavior: 'smooth' }}
                    >
                        {categories.map((category) => {
                            const Icon = categoryIconMap[category] || MdApps
                            const imageSrc = getCategoryImage(category)
                            const isActive = selectedCategory === category
                            const handleClick = (e) => {
                                if (isDragging.current) {
                                    e.preventDefault()
                                    return
                                }
                                setSelectedCategory(category)
                            }
                            return (
                                <button
                                    key={category}
                                    onClick={handleClick}
                                    className={`snap-start shrink-0 flex flex-col items-center justify-start group ${isActive ? 'text-purple-700' : 'text-gray-800'}`}
                                    style={{ width: '104px' }}
                                >
                                    <div className={`w-full h-24 rounded-md overflow-hidden border-2 ${isActive ? 'border-purple-500 shadow-md' : 'border-gray-200'} bg-white`}>                                            
                                        {imageSrc ? (
                                            <img src={imageSrc} alt={category} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                                                <Icon className="h-7 w-7 text-gray-500" />
                                            </div>
                                        )}
                                    </div>
                                    <span className="mt-2 text-xs sm:text-sm text-center line-clamp-1">{category}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Filter Panel (Modal/Sheet) */}
                {showFilterPanel && (
                    <div className="fixed inset-0 z-50" onClick={() => setIsFilterOpen(false)}>
                        <div
                            className="absolute inset-0 bg-black/30"
                            aria-hidden="true"
                        />
                        <div className={`absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-xl border-l border-gray-200 ${filterAnimationClass}`} onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between px-4 py-3 border-b bg-purple-600 text-white">
                                <h2 className="text-lg font-semibold">Filters</h2>
                                <button
                                    onClick={() => setIsFilterOpen(false)}
                                    className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/20"
                                >
                                    Close
                                </button>
                            </div>
                            <div className="p-4 space-y-6 overflow-y-auto">
                                {/* Price Range */}
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">Price Range</h3>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1">
                                            <label className="block text-xs text-gray-500">Min</label>
                                            <input
                                                type="number"
                                                value={priceMin}
                                                min={globalMin}
                                                max={priceMax}
                                                onChange={(e) => setPriceMin(Number(e.target.value))}
                                                className="w-full border rounded-md px-2 py-1"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs text-gray-500">Max</label>
                                            <input
                                                type="number"
                                                value={priceMax}
                                                min={priceMin}
                                                max={globalMax}
                                                onChange={(e) => setPriceMax(Number(e.target.value))}
                                                className="w-full border rounded-md px-2 py-1"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Rating */}
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">Minimum Rating</h3>
                                    <select
                                        value={minRating}
                                        onChange={(e) => setMinRating(Number(e.target.value))}
                                        className="w-full border rounded-md px-2 py-2"
                                    >
                                        <option value={0}>Any</option>
                                        <option value={3}>3+ stars</option>
                                        <option value={4}>4+ stars</option>
                                        <option value={4.5}>4.5+ stars</option>
                                    </select>
                                </div>

                                {/* Featured */}
                                <div className="flex items-center gap-2">
                                    <input
                                        id="featured"
                                        type="checkbox"
                                        checked={featuredOnly}
                                        onChange={(e) => setFeaturedOnly(e.target.checked)}
                                        className="h-4 w-4"
                                    />
                                    <label htmlFor="featured" className="text-sm text-gray-700">Featured only</label>
                                </div>

                                {/* Brand (if present) */}
                                {brands.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-700 mb-2">Brand</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            {brands.map((b) => {
                                                const checked = selectedBrands.includes(b)
                                                return (
                                                    <label key={b} className={`flex items-center gap-2 border rounded-md px-2 py-2 ${checked ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}>
                                                        <input
                                                            type="checkbox"
                                                            checked={checked}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedBrands(prev => [...prev, b])
                                                                } else {
                                                                    setSelectedBrands(prev => prev.filter(x => x !== b))
                                                                }
                                                            }}
                                                        />
                                                        <span className="text-sm">{b}</span>
                                                    </label>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center justify-between pt-2 border-t">
                                    <button
                                        onClick={() => {
                                            setPriceMin(globalMin)
                                            setPriceMax(globalMax)
                                            setMinRating(0)
                                            setFeaturedOnly(false)
                                            setSelectedBrands([])
                                        }}
                                        className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                                    >
                                        Clear all
                                    </button>
                                    <button
                                        onClick={() => setIsFilterOpen(false)}
                                        className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white"
                                    >
                                        Apply filters
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Category Panel (Right Slide-out) */}
                {showCategoryPanel && (
                    <div className="fixed inset-0 z-50" onClick={() => setIsCategoryOpen(false)}>
                        <div className="absolute inset-0 bg-black/30" aria-hidden="true" />
                        <div
                            className={`absolute right-0 top-0 h-full w-full sm:w-80 bg-white shadow-xl border-l border-gray-200 ${categoryAnimationClass}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between px-4 py-3 border-b bg-purple-600 text-white">
                                <h2 className="text-lg font-semibold">Categories</h2>
                                <button
                                    onClick={() => setIsCategoryOpen(false)}
                                    className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/20"
                                    aria-label="Close categories panel"
                                >
                                    Close
                                </button>
                            </div>
                            <div className="p-3 overflow-y-auto h-[calc(100%-56px)]">
                                <ul className="space-y-1">
                                    {categories.map((cat) => {
                                        const isActive = selectedCategory === cat
                                        return (
                                            <li key={cat}>
                                                <button
                                                    onClick={() => {
                                                        setSelectedCategory(cat)
                                                        setIsCategoryOpen(false)
                                                    }}
                                                    className={`w-full text-left px-3 py-2 rounded-md border transition-colors ${isActive ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 hover:bg-gray-50 text-gray-800'}`}
                                                >
                                                    <span className="inline-flex items-center gap-2">
                                                        {(categoryIconMap[cat] || MdApps)({ className: 'w-4 h-4 text-purple-600' })}
                                                        {cat}
                                                    </span>
                                                </button>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
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

// Local animation keyframes for right-side slide panel
// Keeping styles close to component for easier iteration; can be moved later.
// eslint-disable-next-line
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