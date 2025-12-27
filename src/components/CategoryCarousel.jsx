import React, { useEffect, useRef } from 'react'
import { MdDevices, MdSettings, MdHome, MdWork, MdApps } from 'react-icons/md'

const categoryIconMap = {
    Electronics: MdDevices,
    Accessories: MdSettings,
    Home: MdHome,
    Office: MdWork,
    All: MdApps,
}

const CategoryCarousel = ({
    categories = [],
    selectedCategory,
    onSelectCategory,
}) => {
    const carouselRef = useRef(null)
    const isDragging = useRef(false)
    const isHovered = useRef(false)
    const startX = useRef(0)
    const scrollStart = useRef(0)

    /* ---------- Drag scroll ---------- */
    const onPointerDown = (e) => {
        const el = carouselRef.current
        if (!el) return
        isDragging.current = true
        startX.current = e.clientX || e.touches?.[0]?.clientX || 0
        scrollStart.current = el.scrollLeft
    }

    const onPointerMove = (e) => {
        if (!isDragging.current) return
        e.preventDefault()
        const el = carouselRef.current
        if (!el) return
        const x = e.clientX || e.touches?.[0]?.clientX || 0
        el.scrollLeft = scrollStart.current + (startX.current - x)
    }

    const stopDragging = () => {
        isDragging.current = false
    }

    /* ---------- Auto scroll ---------- */
    useEffect(() => {
        const el = carouselRef.current
        if (!el || categories.length === 0) return

        let rafId
        const speed = 0.5

        const loop = () => {
            if (!isHovered.current && !isDragging.current) {
                el.scrollLeft += speed

                // Reset at half because we duplicate items once
                if (el.scrollLeft >= el.scrollWidth / 2) {
                    el.scrollLeft = 0
                }
            }
            rafId = requestAnimationFrame(loop)
        }

        rafId = requestAnimationFrame(loop)
        return () => cancelAnimationFrame(rafId)
    }, [categories])

    // Duplicate categories once for infinite scroll
    const displayCategories = [...categories, ...categories]

    return (
        <div className="mb-6">
            <div
                ref={carouselRef}
                onMouseDown={onPointerDown}
                onMouseMove={onPointerMove}
                onMouseUp={stopDragging}
                // onMouseLeave={stopDragging}
                onTouchStart={onPointerDown}
                onTouchMove={onPointerMove}
                onTouchEnd={stopDragging}
                onMouseEnter={() => (isHovered.current = true)}
                onMouseLeave={() => (isHovered.current = false)}
                className="flex gap-3 overflow-x-auto no-scrollbar px-1 select-none cursor-grab active:cursor-grabbing"
            >
                {displayCategories.map((cat, idx) => {
                    const Icon = categoryIconMap[cat.name] || MdApps
                    const isActive = selectedCategory === cat.name

                    return (
                        <button
                            key={`${cat.name}-${idx}`}
                            onClick={() => onSelectCategory(cat.name)}
                            className={`shrink-0 flex flex-col items-center ${isActive ? 'text-purple-700' : 'text-gray-800'
                                }`}
                            style={{ width: 104 }}
                        >
                            <div
                                className={`w-full h-24 rounded-md border-2 overflow-hidden ${isActive
                                        ? 'border-purple-500 shadow-md'
                                        : 'border-gray-200'
                                    } bg-white`}
                            >
                                {cat.logo ? (
                                    <img
                                        src={cat.logo}
                                        alt={cat.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                        <Icon className="w-7 h-7 text-gray-500" />
                                    </div>
                                )}
                            </div>

                            <span className="mt-2 text-xs sm:text-sm text-center truncate">
                                {cat.name}
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

export default CategoryCarousel
