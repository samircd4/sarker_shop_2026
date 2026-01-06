import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { FaStar, FaShoppingCart } from "react-icons/fa";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { useCart } from "../context/CartContext.jsx";
import api from "../api/client";
import { toast } from "react-toastify";
import Spacification from "../components/Spacification.jsx";
import ProAttributes from "../components/ProAttributes.jsx";

const API_URL = import.meta.env.VITE_API_URL;

const Tabs = ({ product }) => {
    const [activeTab, setActiveTab] = useState("spacification");
    const tabs = [
        { key: "spacification", label: "Spacification" },
        { key: "description", label: "Description" },
        { key: "reviews", label: `Ratings & Reviews ${product.reviews_count ?? 0}` },
    ];

    return (
        <div className="mt-10">
            <div className="flex gap-8 text-sm text-purple-600 mt-4 border-b">
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className={`px-2 py-1 border-b-2 ${activeTab === t.key ? "text-purple-700 border-purple-700" : "border-transparent hover:text-purple-700"}`}
                        aria-current={activeTab === t.key ? "page" : undefined}
                    >
                        {t.label}
                    </button>
                ))}
            </div>
            <div className="mt-6">
                {activeTab === "spacification" && (
                    <Spacification specifications={product.specifications || []} />
                )}
                {activeTab === "description" && (
                    <div className="text-gray-700">{product.description || "No description available."}</div>
                )}
                {activeTab === "reviews" && (
                    <div className="text-gray-700">{product.reviews_count ? `${product.reviews_count} reviews` : "No reviews yet."}</div>
                )}
            </div>
        </div>
    );
};

const ProductDetails = () => {
    const { id } = useParams();
    const { addToCart } = useCart();

    // ALL HOOKS AT THE TOP — NO CONDITIONALS BEFORE THEM!
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [activeIndex, setActiveIndex] = useState(0);
    const [prevIndex, setPrevIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [direction, setDirection] = useState("right");
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const [isNextLoaded, setIsNextLoaded] = useState(true);
    const [zoomOpen, setZoomOpen] = useState(false);
    const [selectedColor, setSelectedColor] = useState("");
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [qty, setQty] = useState(1);
    const [paused, setPaused] = useState(false);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    const PLACEHOLDER_IMAGE = "https://via.placeholder.com/800x800?text=Image+Unavailable";
    const PRICE_COLOR_HEX = "#7e22ce";

    // Build images from backend shape: image + gallery_images[].image
    const images = useMemo(() => {
        if (!product) return [PLACEHOLDER_IMAGE];
        const main = product.image;
        const extras = Array.isArray(product.gallery_images)
            ? product.gallery_images
                .map((i) => i && i.image)
                .filter(Boolean)
            : [];
        const result = [];
        if (main) result.push(main);
        for (const img of extras) if (!result.includes(img)) result.push(img);
        return result.length > 0 ? result : [PLACEHOLDER_IMAGE];
    }, [product]);

    // Safe destructuring (with fallbacks)
    const {
        name = "Unnamed Product",
        price = "0",
        discount_price = null,
        description = "No description available.",
        rating = 0,
        reviews_count = 0,
        stock_quantity = 0,
        brand: brandObj,
        specifications = [],
        variants = [],
        category: categoryObj = {},
    } = product || {};

    const brand = brandObj?.name || "Unknown Brand";
    const reviews = typeof reviews_count === "number" ? reviews_count : 0;

    const filledStars = Math.round(rating);
    const handleImageError = (e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = PLACEHOLDER_IMAGE;
    };

    const preloadAndAnimate = useCallback((newIndex) => {
        if (newIndex === activeIndex || isAnimating || newIndex < 0 || newIndex >= images.length) return;

        setIsNextLoaded(false);
        const img = new Image();
        img.src = images[newIndex];
        img.onload = () => {
            setPrevIndex(activeIndex);
            setActiveIndex(newIndex);
            setDirection(newIndex > activeIndex ? "right" : "left");
            setIsAnimating(true);
            setIsNextLoaded(true);
            setTimeout(() => {
                setIsAnimating(false);
                setPrevIndex(newIndex);
            }, 700);
        };
        img.onerror = () => setIsNextLoaded(true);
    }, [activeIndex, isAnimating, images]);

    const next = useCallback(() => {
        if (activeIndex < images.length - 1) preloadAndAnimate(activeIndex + 1);
    }, [activeIndex, images, preloadAndAnimate]);

    const prev = useCallback(() => {
        if (activeIndex > 0) preloadAndAnimate(activeIndex - 1);
    }, [activeIndex, preloadAndAnimate]);

    // Fetch product
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.get(`/products/${encodeURIComponent(id)}/`);
                setProduct(response.data);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load product");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    // Derive variant options and selection
    const variantColors = useMemo(() => {
        const set = new Set();
        (variants || []).forEach(v => { if (v.color) set.add(v.color); });
        return Array.from(set);
    }, [variants]);

    const filteredVariants = useMemo(() => {
        const list = Array.isArray(variants) ? variants : [];
        const pool = selectedColor ? list.filter(v => v.color === selectedColor) : list;
        const seen = new Set();
        const unique = [];
        for (const v of pool) {
            const key = `${v.ram ?? ''}-${v.storage ?? ''}`;
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(v);
            }
        }
        return unique;
    }, [variants, selectedColor]);

    useEffect(() => {
        const list = filteredVariants;
        setSelectedVariant(list[0] || null);
    }, [filteredVariants]);

    const displayPrice = useMemo(() => {
        const raw = selectedVariant ? (selectedVariant.discount_price || selectedVariant.price) : (discount_price || price);
        const n = Number(raw);
        return Number.isFinite(n) ? n : 0;
    }, [selectedVariant, discount_price, price]);

    const stockStatus = useMemo(() => {
        const s = selectedVariant ? Number(selectedVariant.stock_quantity || 0) : Number(stock_quantity || 0);
        return s > 0 ? "in_stock" : "out_of_stock";
    }, [selectedVariant, stock_quantity]);

    // Reset quantity when variant changes to avoid carrying over previous variant qty
    useEffect(() => {
        setQty(1);
    }, [selectedVariant]);

    // Respect prefers-reduced-motion for gallery transitions and slideshow
    useEffect(() => {
        const mq = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
        const handler = () => setPrefersReducedMotion(!!mq.matches);
        if (mq) {
            handler();
            mq.addEventListener('change', handler);
        }
        return () => {
            if (mq) mq.removeEventListener('change', handler);
        };
    }, []);

    // Auto-advance slideshow every 3s when not paused/zoomed and motion allowed
    useEffect(() => {
        if (prefersReducedMotion || zoomOpen || paused || images.length <= 1) return;
        const interval = setInterval(() => {
            next();
        }, 3000);
        return () => clearInterval(interval);
    }, [prefersReducedMotion, zoomOpen, paused, images, activeIndex, next]);

    // Early returns AFTER all hooks
    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                <div className="inline-block">
                    <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading product...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-8 inline-block">
                    <h2 className="text-2xl font-bold text-red-800 mb-2">Error</h2>
                    <p className="text-red-600 mb-6">{error}</p>
                    <Link to="/products" className="text-purple-600 hover:underline font-medium">
                        ← Back to Products
                    </Link>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 inline-block">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
                    <p className="text-gray-600 mb-6">We couldn't find this product.</p>
                    <Link to="/products" className="text-purple-600 hover:underline font-medium">
                        ← Back to Products
                    </Link>
                </div>
            </div>
        );
    }

    // Rest of your logic (safe now)
    const handleAddToCart = async () => {
        if (stockStatus !== "in_stock") {
            toast.error("Sorry, this item is out of stock.");
            return;
        }
        try {
            const body = selectedVariant
                ? { product_id: product.id, variant_id: selectedVariant.id, quantity: qty }
                : { product_id: product.id, quantity: qty };
            await api.post('/cart-items/', body);
            const payload = selectedVariant ? {
                ...product,
                price: Number(selectedVariant.discount_price || selectedVariant.price) || Number(price) || 0,
                variant: {
                    id: selectedVariant.id,
                    sku: selectedVariant.sku,
                    color: selectedVariant.color,
                    ram: selectedVariant.ram,
                    storage: selectedVariant.storage
                }
            } : {
                ...product,
                price: Number(discount_price || price) || 0
            };
            for (let i = 0; i < qty; i++) addToCart(payload);
        } catch {
            toast.error("Failed to add to cart");
        }
    };



    const onTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
    const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const diff = touchStart - touchEnd;
        if (Math.abs(diff) > 50) {
            diff > 0 ? next() : prev();
        }
        setTouchStart(0);
        setTouchEnd(0);
    };


    // Render JSX (same as before, just safe now)
    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-6">
                <ol className="flex items-center gap-2">
                    <li><Link to="/products" className="hover:text-purple-700 focus-visible:outline-none focus-visible:ring-2 ring-purple-700 rounded">Products</Link></li>
                    <li>›</li>
                    <li><Link to={`/category/${categoryObj?.slug || ''}`} className="hover:text-purple-700 focus-visible:outline-none focus-visible:ring-2 ring-purple-700 rounded"><span>{categoryObj?.name || "Category"}</span></Link></li>
                    <li>›</li>
                    <li><span>{product?.name || "Product Name"}</span></li>
                </ol>
            </nav>
            {/* Your full UI here — unchanged */}
            {/* ... (Breadcrumb, Grid, Image Gallery, Info, Tabs, Zoom Modal) ... */}

            {/* Example snippet of image gallery (rest is same) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <div className="relative bg-white rounded-xl shadow overflow-hidden">
                        <div
                            className="relative aspect-square lg:h-[500px] cursor-zoom-in"
                            onTouchStart={onTouchStart}
                            onTouchMove={onTouchMove}
                            onTouchEnd={onTouchEnd}
                            onClick={() => setZoomOpen(true)}
                            onMouseEnter={() => setPaused(true)}
                            onMouseLeave={() => setPaused(false)}
                            onFocus={() => setPaused(true)}
                            onBlur={() => setPaused(false)}
                        >
                            {/* Image layers */}
                            {isAnimating && prevIndex !== activeIndex && (
                                <img
                                    src={images[prevIndex]}
                                    alt=""
                                    className={`absolute inset-0 w-full h-full object-cover ${direction === "right" ? "gallery-exit-left" : "gallery-exit-right"
                                        }`}
                                    onError={handleImageError}
                                />
                            )}
                            <img
                                src={images[activeIndex]}
                                alt={name}
                                className={`absolute inset-0 w-full h-full object-cover ${isAnimating
                                    ? direction === "right" ? "gallery-enter-right" : "gallery-enter-left"
                                    : "gallery-transition opacity-100"
                                    }`}
                                onError={handleImageError}
                            />
                            {!isNextLoaded && (
                                <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                                    <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full" />
                                </div>
                            )}
                            {images.length > 1 && (
                                <>
                                    <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow"><IoChevronBack /></button>
                                    <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow"><IoChevronForward /></button>
                                </>
                            )}
                        </div>
                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="mt-4 flex gap-2 overflow-x-auto snap-x snap-mandatory">
                                {images.map((src, i) => (
                                    <button
                                        key={i}
                                        onClick={() => preloadAndAnimate(i)}
                                        className={`w-20 h-20 sm:w-24 sm:h-24 border-2 rounded-lg overflow-hidden snap-start ${i === activeIndex ? "border-purple-600" : "border-gray-300"}`}
                                    >
                                        <img src={src} alt="" className="w-full h-full object-cover" onError={handleImageError} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Product Info */}
                <div className="bg-white rounded-xl shadow p-6">
                    <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
                    <div className="mt-1 flex items-center gap-3">
                        {brandObj?.logo && <img src={brandObj.logo} alt={brand} className="w-6 h-6 object-contain rounded" onError={handleImageError} />}
                        <span className="text-sm text-gray-600">Brand: {brand}</span>
                        {product.sku && <span className="text-xs text-gray-500">SKU: {product.sku}</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <FaStar key={i} style={{ color: i < filledStars ? PRICE_COLOR_HEX : "#D1D5DB" }} />
                        ))}
                        <span className="text-sm text-gray-600">{rating.toFixed(1)}</span>
                        <span className="text-sm text-gray-500">({reviews} reviews)</span>
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                        <span className="text-3xl font-bold" style={{ color: PRICE_COLOR_HEX }}>৳ {Number(displayPrice).toFixed(0)}</span>
                        <span className={`px-2 py-1 rounded text-sm ${stockStatus === "in_stock" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {stockStatus === "in_stock" ? "In Stock" : "Out of Stock"}
                        </span>
                    </div>
                    <div className="border-t my-6" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div className="text-sm text-gray-600 mb-2 font-medium">Color</div>
                            <div className="flex flex-wrap gap-2">
                                {variantColors.length === 0 && <span className="text-xs text-gray-500">No color variants</span>}
                                {variantColors.map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => { setSelectedColor(c); }}
                                        aria-pressed={selectedColor === c}
                                        className={`px-3 h-9 rounded-md border cursor-pointer ${selectedColor === c ? "border-purple-700 bg-purple-50" : "border-gray-300 bg-white"} hover:border-purple-700 focus-visible:outline-none focus-visible:ring-2 ring-purple-700 text-sm`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-600 mb-2 font-medium">RAM / Storage</div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {filteredVariants.length === 0 && (
                                    <span className="text-xs text-gray-500">No variants</span>
                                )}
                                {filteredVariants.map((v) => {
                                    const active = selectedVariant?.id === v.id;
                                    const disabled = Number(v.stock_quantity || 0) <= 0;
                                    return (
                                        <button
                                            key={v.id}
                                            onClick={() => setSelectedVariant(v)}
                                            disabled={disabled}
                                            aria-pressed={active}
                                            className={`p-2 border rounded-md text-sm cursor-pointer ${active ? "border-purple-700 bg-purple-50" : "border-gray-300"} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                                        >
                                            {v.ram}GB/{v.storage}GB
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                    <div className="border-t my-6" />
                    <div className="text-sm text-gray-700">
                        {stockStatus === "in_stock"
                            ? `In Stock (${selectedVariant ? selectedVariant.stock_quantity : product.stock_quantity} available)`
                            : "Currently unavailable"}
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center border rounded-md">
                            <button aria-label="Decrease quantity" onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 ring-purple-700 cursor-pointer">−</button>
                            <input className="w-12 text-center outline-none py-2" type="text" min="1" value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} />
                            <button aria-label="Increase quantity" onClick={() => setQty(qty + 1)} className="px-3 py-2 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 ring-purple-700 cursor-pointer">+</button>
                        </div>
                        <button onClick={handleAddToCart} className="px-5 py-3 rounded-md bg-purple-700 hover:bg-purple-800 text-white focus-visible:outline-none focus-visible:ring-2 ring-purple-700 cursor-pointer" disabled={stockStatus !== "in_stock"}>Add to cart</button>
                    </div>

                    {/* ####################################################### */}

                    <div>
                        <ProAttributes product={product} />
                    </div>



                    <div className="mt-6">
                        <Link to="/products" className="px-5 py-3 inline-block rounded-md border border-gray-300 text-gray-700 hover:border-purple-700 focus-visible:outline-none focus-visible:ring-2 ring-purple-700">Back to Products</Link>
                    </div>
                </div>
            </div>

            <Tabs product={{ name, description, rating, reviews, specifications }} />

            {zoomOpen && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center" onClick={() => setZoomOpen(false)}>
                    <img src={images[activeIndex]} alt="Zoomed" className="max-w-full max-h-full object-contain" />
                </div>
            )}
        </div>
    );
};

export default ProductDetails;
