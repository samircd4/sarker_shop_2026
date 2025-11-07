import React, { useMemo, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import productsData from '../data/products.json'
import { FaStar, FaShoppingCart } from 'react-icons/fa'
import { IoChevronBack, IoChevronForward } from 'react-icons/io5'
import { useCart } from '../context/CartContext.jsx'

const ProductDetails = () => {
    const { id } = useParams()
    const productId = Number(id)
    const { addToCart } = useCart()
    const product = productsData.find(p => p.id === productId)

    const requiredFields = ['id', 'name', 'price', 'image']
    const validationErrors = []
    if (product) {
        requiredFields.forEach(field => { if (product[field] == null) validationErrors.push(`Missing field: ${field}`) })
    }

    const isValidUrl = (str) => {
        try { new URL(str); return true } catch { return false }
    }

    if (!product) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12">
                <p className="text-gray-700">Product not found.</p>
                <Link to="/products" className="inline-block mt-4 text-purple-600 hover:text-purple-700">Back to products</Link>
            </div>
        )
    }

    const images = useMemo(() => {
        // Support multiple images if available, otherwise fallback to the single image
        const list = product.images && Array.isArray(product.images) && product.images.length > 0
            ? product.images
            : [product.image]
        return list.filter(Boolean).filter(isValidUrl)
    }, [product])

    // Carousel state, swipe support, and transitions
    const [activeIndex, setActiveIndex] = useState(0)
    const [prevIndex, setPrevIndex] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)
    const [transitionType, setTransitionType] = useState('fade') // 'fade' | 'slide'
    const [direction, setDirection] = useState('right') // 'left' | 'right'
    const [isNextLoaded, setIsNextLoaded] = useState(true)
    const touchStartX = useRef(0)
    const touchDeltaX = useRef(0)
    const onTouchStart = (e) => {
        touchStartX.current = e.touches?.[0]?.clientX || 0
        touchDeltaX.current = 0
    }
    const onTouchMove = (e) => {
        const x = e.touches?.[0]?.clientX || 0
        touchDeltaX.current = x - touchStartX.current
    }
    const onTouchEnd = () => {
        const threshold = 50
        if (touchDeltaX.current > threshold) prev()
        else if (touchDeltaX.current < -threshold) next()
        touchStartX.current = 0
        touchDeltaX.current = 0
    }

    const preloadAndAnimate = (targetIndex, variant = 'fade', dir = 'right') => {
        if (!images.length) return
        setTransitionType(variant)
        setDirection(dir)
        const nextSrc = images[targetIndex]
        if (!nextSrc) return
        setIsNextLoaded(false)
        const preloader = new Image()
        preloader.src = nextSrc
        preloader.onload = () => {
            setPrevIndex(activeIndex)
            setActiveIndex(targetIndex)
            setIsAnimating(true)
            setIsNextLoaded(true)
            setTimeout(() => setIsAnimating(false), 400)
        }
        preloader.onerror = () => {
            setPrevIndex(activeIndex)
            setActiveIndex(targetIndex)
            setIsAnimating(true)
            setTimeout(() => setIsAnimating(false), 400)
        }
    }

    const next = () => {
        if (!images.length) return
        const idx = (activeIndex + 1) % images.length
        preloadAndAnimate(idx, 'slide', 'right')
    }

    const prev = () => {
        if (!images.length) return
        const idx = (activeIndex - 1 + images.length) % images.length
        preloadAndAnimate(idx, 'slide', 'left')
    }

    const stars = Array.from({ length: 5 }, (_, i) => i < Math.floor(product.rating ?? 0))

    // Metadata fallbacks
    const brandName = product.brand || 'Unknown'
    const brandUrl = product.brandUrl || '#'
    const brandLogo = product.brandLogo || null
    const category = product.category || 'General'

    const stockStatus = (product.stockStatus || 'in_stock').toLowerCase()
    const quantityAvailable = product.quantityAvailable ?? null
    const restockDate = product.restockDate ?? null

    const [zoomOpen, setZoomOpen] = useState(false)

    const buildSrcSet = (src) => {
        if (!src || typeof src !== 'string') return undefined
        const widths = [400, 800, 1200]
        // Try to append width param for Unsplash-like URLs
        return widths.map(w => `${src.split('?')[0]}?w=${w}&fit=crop ${w}w`).join(', ')
    }

    const sizes = '(max-width: 768px) 100vw, 50vw'

    const [imageError, setImageError] = useState(false)

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <nav className="text-sm text-gray-600 mb-4">
                <Link to="/" className="hover:text-purple-700">Home</Link>
                <span className="mx-2">/</span>
                <Link to="/products" className="hover:text-purple-700">Products</Link>
                <span className="mx-2">/</span>
                <Link to="/products" className="hover:text-purple-700">{category}</Link>
                <span className="mx-2">/</span>
                <span className="text-gray-800 font-medium">{product.name}</span>
            </nav>

            {/* Top section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                {/* Image gallery with carousel */}
                <div>
                    <div className="relative bg-white rounded-lg shadow overflow-hidden">
                        <div
                            className="relative w-full h-[22rem] md:h-[28rem]"
                            onTouchStart={onTouchStart}
                            onTouchMove={onTouchMove}
                            onTouchEnd={onTouchEnd}
                        >
                            {/* Previous image layer (animates out) */}
                            <img
                                src={images[prevIndex]}
                                srcSet={buildSrcSet(images[prevIndex])}
                                sizes={sizes}
                                alt={`${product.name} - view ${prevIndex + 1}`}
                                className={`absolute inset-0 w-full h-full object-contain ${transitionType === 'fade'
                                        ? `transition-opacity duration-400 ease-in-out ${isAnimating ? 'opacity-0' : 'opacity-100'}`
                                        : `transition-transform duration-400 ease-in-out ${isAnimating ? (direction === 'left' ? '-translate-x-full' : 'translate-x-full') : 'translate-x-0'}`
                                    } ${!isAnimating && prevIndex === activeIndex ? 'hidden' : ''}`}
                                onClick={() => setZoomOpen(v => !v)}
                                onError={() => setImageError(true)}
                            />

                            {/* Current image layer (animates in) */}
                            <img
                                src={images[activeIndex]}
                                srcSet={buildSrcSet(images[activeIndex])}
                                sizes={sizes}
                                alt={`${product.name} - view ${activeIndex + 1}`}
                                className={`absolute inset-0 w-full h-full object-contain ${transitionType === 'fade'
                                        ? `transition-opacity duration-400 ease-in-out ${isAnimating ? 'opacity-100' : 'opacity-100'}`
                                        : `transition-transform duration-400 ease-in-out ${isAnimating ? 'translate-x-0' : (direction === 'left' ? 'translate-x-full' : '-translate-x-full')}`
                                    } ${zoomOpen ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
                                loading="lazy"
                                decoding="async"
                                onClick={() => setZoomOpen(v => !v)}
                                onError={() => setImageError(true)}
                            />

                            {/* Loading overlay to prevent flicker while preloading next image */}
                            {!isNextLoaded && (
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                                    <div className="animate-pulse w-12 h-12 rounded-full bg-gray-300" />
                                </div>
                            )}
                        </div>

                        {imageError && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-600">Image failed to load</div>
                        )}
                        {images.length > 1 && (
                            <>
                                <button
                                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/85 text-gray-800 p-2 rounded-full shadow border border-gray-200 hover:bg-black/10 active:scale-95 active:bg-black/20 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    aria-label="Previous image"
                                    onClick={prev}
                                >
                                    <IoChevronBack className="w-5 h-5" />
                                </button>
                                <button
                                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/85 text-gray-800 p-2 rounded-full shadow border border-gray-200 hover:bg-black/10 active:scale-95 active:bg-black/20 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    aria-label="Next image"
                                    onClick={next}
                                >
                                    <IoChevronForward className="w-5 h-5" />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {images.length > 1 && (
                        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
                            {images.map((src, i) => (
                                <button
                                    key={i}
                                    onClick={() => preloadAndAnimate(i, 'fade', i > activeIndex ? 'right' : 'left')}
                                    className={`w-16 h-16 rounded-md overflow-hidden border ${i === activeIndex ? 'border-purple-600' : 'border-gray-300'}`}
                                >
                                    <img
                                        src={src}
                                        alt={`${product.name} thumbnail ${i + 1}`}
                                        loading="lazy"
                                        decoding="async"
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.currentTarget.src = images[activeIndex] || product.image }}
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product info */}
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                    <div className="flex items-center mb-3">
                        <div className="flex">
                            {stars.map((on, i) => (
                                <FaStar key={i} className={on ? 'text-purple-600' : 'text-gray-300'} />
                            ))}
                        </div>
                        <span className="text-sm text-gray-500 ml-2">({product.reviews} reviews)</span>
                    </div>

                    <p className="text-gray-700 mb-4">{product.description || 'No description available.'}</p>
                    <div className="mb-3">
                        <span className="text-xl md:text-2xl font-bold text-primary-600">BDT {product.price}</span>
                    </div>

                    {/* Metadata below price */}
                    <div className="space-y-2 mb-5">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-600">Brand:</span>
                            {brandLogo ? (
                                <img src={brandLogo} alt={brandName} className="w-5 h-5" />
                            ) : null}
                            <a href={brandUrl} className="text-gray-800 hover:text-purple-700 font-medium" target="_blank" rel="noreferrer">{brandName}</a>
                        </div>

                        {/* Variants */}
                        {Array.isArray(product.variants) && product.variants.length > 0 && (
                            <VariantSelectors variants={product.variants} />
                        )}
                        <div className="flex items-center gap-2">
                            <span className="text-gray-600">Category:</span>
                            <Link to="/products" className="text-gray-800 hover:text-purple-700 font-medium">{category}</Link>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-gray-600">Stock:</span>
                            {stockStatus === 'in_stock' ? (
                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-700">In Stock</span>
                            ) : (
                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-700">Out of Stock</span>
                            )}
                            {quantityAvailable != null && (
                                <span className="text-sm text-gray-700">Qty available: {quantityAvailable}</span>
                            )}
                            {restockDate && stockStatus !== 'in_stock' && (
                                <span className="text-sm text-gray-700">Restock: {restockDate}</span>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => addToCart(product)}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-md inline-flex items-center gap-2"
                        >
                            <FaShoppingCart />
                            Add to Cart
                        </button>
                        <Link
                            to="/products"
                            className="border border-gray-300 hover:bg-gray-50 text-gray-800 px-5 py-2 rounded-md"
                        >
                            Back to Products
                        </Link>
                    </div>
                </div>
            </div>

            {/* Validation messages */}
            {validationErrors.length > 0 && (
                <div className="mt-6 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-3">
                    <div className="font-medium mb-1">Some product data is missing:</div>
                    <ul className="list-disc ml-5 text-sm">
                        {validationErrors.map((e, i) => (<li key={i}>{e}</li>))}
                    </ul>
                </div>
            )}

            {/* Tabs */}
            <Tabs product={product} />

            {/* Zoom modal */}
            {zoomOpen && (
                <div
                    className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
                    onClick={() => setZoomOpen(false)}
                >
                    <img
                        src={images[activeIndex]}
                        alt={`${product.name} - zoom view ${activeIndex + 1}`}
                        className="max-w-[90vw] max-h-[85vh] object-contain"
                    />
                </div>
            )}
        </div>
    )
}

const Tabs = ({ product }) => {
    const [active, setActive] = useState('Specification')
    const tabs = ['Specification', 'Description', 'Reviews', 'FAQs']
    return (
        <div className="mt-8">
            <div className="flex flex-wrap gap-2 border-b">
                {tabs.map(t => (
                    <button
                        key={t}
                        onClick={() => setActive(t)}
                        className={`px-3 py-2 text-sm rounded-t-md ${active === t ? 'bg-purple-600 text-white' : 'bg-white text-gray-800 border'} transition-colors`}
                    >
                        {t}
                    </button>
                ))}
            </div>
            <div className="bg-white border rounded-b-md p-4">
                {active === 'Specification' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {product.specifications && typeof product.specifications === 'object' ? (
                            Object.entries(product.specifications).map(([k, v]) => (
                                <SpecRow key={k} label={k} value={String(v)} />
                            ))
                        ) : (
                            <>
                                <SpecRow label="Category" value={product.category || 'General'} />
                                <SpecRow label="Price" value={`BDT ${product.price}`} />
                                <SpecRow label="Rating" value={`${product.rating ?? 0} / 5`} />
                                <SpecRow label="Reviews" value={`${product.reviews ?? 0}`} />
                            </>
                        )}
                    </div>
                )}
                {active === 'Description' && (
                    <div className="text-gray-700 leading-relaxed">
                        {product.description || 'No description available.'}
                    </div>
                )}
                {active === 'Reviews' && (
                    <div className="space-y-3">
                        <p className="text-gray-700">Customer reviews coming soon.</p>
                        <div className="text-sm text-gray-600">Average rating: {product.rating ?? 0} based on {product.reviews ?? 0} reviews.</div>
                    </div>
                )}
                {active === 'FAQs' && (
                    <div className="space-y-2">
                        <p className="text-gray-700">Have a question? Contact us via the Contact page.</p>
                    </div>
                )}
                {active === 'Video' && (
                    <div className="aspect-video bg-black/5 flex items-center justify-center text-gray-600">
                        {product.videoUrl ? (
                            <iframe
                                className="w-full h-full"
                                src={product.videoUrl}
                                title={`${product.name} video`}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            />
                        ) : (
                            <span>No video available.</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

const SpecRow = ({ label, value }) => (
    <div className="flex items-center justify-between bg-gray-50 rounded-md px-3 py-2">
        <span className="text-gray-800 font-medium">{label}</span>
        <span className="text-gray-600">{value}</span>
    </div>
)

const VariantSelectors = ({ variants }) => {
    const [selected, setSelected] = useState({})
    return (
        <div className="mb-5 space-y-3">
            {variants.map((variant, idx) => (
                <div key={idx} className="flex items-center gap-3">
                    <label className="text-gray-700 min-w-24">{variant.name || 'Option'}</label>
                    <select
                        className="border rounded-md px-3 py-2 text-sm"
                        value={selected[variant.name] || ''}
                        onChange={(e) => setSelected(s => ({ ...s, [variant.name]: e.target.value }))}
                    >
                        <option value="">Select</option>
                        {(variant.values || []).map((v, i) => (
                            <option value={v} key={i}>{v}</option>
                        ))}
                    </select>
                </div>
            ))}
        </div>
    )
}

export default ProductDetails