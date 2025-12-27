import React, { useEffect, useRef } from 'react'
import { MdDevices, MdSettings, MdHome, MdWork, MdApps } from 'react-icons/md'

const categoryIconMap = {
    Electronics: MdDevices,
    Accessories: MdSettings,
    Home: MdHome,
    Office: MdWork,
    All: MdApps,
}

const CategoryCarousel = ({ categories, selectedCategory, onSelectCategory }) => {
    const carouselRef = useRef(null)
    const isDragging = useRef(false)
    const startX = useRef(0)
    const scrollStart = useRef(0)
    const isHoveredRef = useRef(false)

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
    const onPointerCancel = () => {
        isDragging.current = false
    }

    useEffect(() => {
        const container = carouselRef.current
        if (!container) return
        const pxPerTick = 1
        const intervalMs = 20
        const tick = () => {
            try {
                if (isHoveredRef.current || isDragging.current) return
                const canScroll = container.scrollWidth > container.clientWidth + 1
                if (!canScroll) return
                container.scrollLeft = container.scrollLeft + pxPerTick
                if (container.scrollLeft >= container.scrollWidth - container.clientWidth - 1) {
                    container.scrollLeft = 0
                }
            } catch { return }
        }
        const id = setInterval(tick, intervalMs)
        return () => {
            clearInterval(id)
        }
    }, [categories])

    return (
        <div className="mb-6">
            <div
                ref={carouselRef}
                onMouseDown={onPointerDown}
                onMouseMove={onPointerMove}
                onMouseUp={onPointerUp}
                onTouchStart={onPointerDown}
                onTouchMove={onPointerMove}
                onTouchEnd={onPointerUp}
                onTouchCancel={onPointerCancel}
                onMouseEnter={() => { isHoveredRef.current = true }}
                onMouseLeave={() => { isHoveredRef.current = false; onPointerUp(); }}
                onFocus={() => { isHoveredRef.current = true }}
                onBlur={() => { isHoveredRef.current = false }}
                className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory px-1 select-none cursor-grab active:cursor-grabbing"
                style={{ scrollBehavior: 'smooth' }}
            >
                {categories.map((cat) => {
                    const category = cat.name
                    const Icon = categoryIconMap[category] || MdApps
                    const imageSrc = cat.logo
                    const isActive = selectedCategory === category
                    const handleClick = (e) => {
                        if (isDragging.current) {
                            e.preventDefault()
                            return
                        }
                        onSelectCategory(category)
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
    )
}

export default CategoryCarousel
