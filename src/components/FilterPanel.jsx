import React, { useEffect, useState } from 'react'

const FilterPanel = ({
    open,
    onClose,
    priceMin,
    priceMax,
    globalMin,
    globalMax,
    onChangePriceMin,
    onChangePriceMax,
    minRating,
    onChangeMinRating,
    featuredOnly,
    onChangeFeaturedOnly,
    brands,
    selectedBrands,
    onToggleBrand,
    onClearAll,
}) => {
    const [showPanel, setShowPanel] = useState(false)
    const [animationClass, setAnimationClass] = useState('')

    useEffect(() => {
        if (open) {
            setShowPanel(true)
            setAnimationClass('animate-slide-in-right')
        } else {
            setAnimationClass('animate-slide-out-right')
            const t = setTimeout(() => setShowPanel(false), 300)
            return () => clearTimeout(t)
        }
    }, [open])

    if (!showPanel) return null

    return (
        <div className="fixed inset-0 z-50" onClick={onClose}>
            <div className="absolute inset-0 bg-black/30" aria-hidden="true" />
            <div
                className={`absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-xl border-l border-gray-200 ${animationClass}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-4 py-3 border-b bg-purple-600 text-white">
                    <h2 className="text-lg font-semibold">Filters</h2>
                    <button
                        onClick={onClose}
                        className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/20"
                    >
                        Close
                    </button>
                </div>
                <div className="p-4 space-y-6 overflow-y-auto">
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
                                    onChange={(e) => onChangePriceMin(Number(e.target.value))}
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
                                    onChange={(e) => onChangePriceMax(Number(e.target.value))}
                                    className="w-full border rounded-md px-2 py-1"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Minimum Rating</h3>
                        <select
                            value={minRating}
                            onChange={(e) => onChangeMinRating(Number(e.target.value))}
                            className="w-full border rounded-md px-2 py-2"
                        >
                            <option value={0}>Any</option>
                            <option value={3}>3+ stars</option>
                            <option value={4}>4+ stars</option>
                            <option value={4.5}>4.5+ stars</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            id="featured"
                            type="checkbox"
                            checked={featuredOnly}
                            onChange={(e) => onChangeFeaturedOnly(e.target.checked)}
                            className="h-4 w-4"
                        />
                        <label htmlFor="featured" className="text-sm text-gray-700">Featured only</label>
                    </div>

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
                                                    onToggleBrand(b, e.target.checked)
                                                }}
                                            />
                                            <span className="text-sm">{b}</span>
                                        </label>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t">
                        <button
                            onClick={onClearAll}
                            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            Clear all
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            Apply filters
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FilterPanel
