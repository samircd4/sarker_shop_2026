// src/components/SearchBar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import productsData from '../data/products.json';

const SearchBar = ({ onFocus, onBlur }) => {
    const [showInput, setShowInput] = useState(false);
    const [query, setQuery] = useState('');
    const [filtered, setFiltered] = useState([]);
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);

    // Filter products as user types
    useEffect(() => {
        if (query.trim() === '') {
            setFiltered([]);
        } else {
            setFiltered(
                productsData.filter(product =>
                    product.name.toLowerCase().includes(query.toLowerCase())
                )
            );
        }
    }, [query]);

    // Focus input when shown on mobile
    useEffect(() => {
        if (showInput && inputRef.current) {
            inputRef.current.focus();
        }
    }, [showInput]);

    // Close search bar and dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target)
            ) {
                setShowInput(false);
                setQuery('');
                setFiltered([]);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Optionally handle search submit
    };

    return (
        <div ref={wrapperRef} className="relative w-full max-w-xl">
            {/* Mobile: search icon button (only when input is hidden) */}
            {!showInput && (
                <button
                    type="button"
                    className="sm:hidden absolute right-0 top-1/2 -translate-y-1/2 p-2 z-10 transition-opacity duration-300"
                    onClick={() => setShowInput(true)}
                    aria-label="Open search"
                >
                    <FiSearch className="text-orange-500 text-2xl" />
                </button>
            )}
            {/* Search input: always visible on sm+, toggled on mobile */}
            <form
                onSubmit={handleSubmit}
                className={`
          w-full flex items-center border-2 border-orange-400 rounded-full px-4 py-2 bg-white
          transition-all duration-300
          ${showInput ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
          sm:opacity-100 sm:scale-100 sm:pointer-events-auto
        `}
            >
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search the product"
                    className="flex-1 outline-none bg-transparent text-gray-600 w-full"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onFocus={onFocus}
                    onBlur={onBlur}
                />
                <button type="submit">
                    <FiSearch className="text-orange-500 text-xl" />
                </button>
            </form>
            {/* Dropdown for filtered products with animation */}
            <div
                className={`
          absolute left-0 right-0 mt-2
          z-50
          transition-all duration-300
          ${filtered.length > 0 ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}
        `}
                style={{ transformOrigin: 'top' }}
            >
                {filtered.length > 0 && (
                    <ul className="bg-white border border-orange-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filtered.map(product => (
                            <li
                                key={product.id}
                                className="px-4 py-2 hover:bg-orange-50 cursor-pointer flex items-center gap-2"
                            >
                                {product.image && (
                                    <img src={product.image} alt={product.name} className="w-8 h-8 object-cover rounded" />
                                )}
                                <span className="font-medium">{product.name}</span>
                                {product.price && (
                                    <span className="ml-auto text-sm text-gray-500">${product.price}</span>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default SearchBar;
