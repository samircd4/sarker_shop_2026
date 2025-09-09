// src/components/BestSellers.jsx
import React from "react";

const bestSellers = [
  { 
    id: 1, 
    name: "Gaming Laptop Z15", 
    price: "$1,299", 
    img: "https://placehold.co/300x300/e2e8f0/1e293b?text=Gaming+Laptop",
    rating: 4.8,
    reviews: 42
  },
  { 
    id: 2, 
    name: "Noise Cancelling Earbuds", 
    price: "$149", 
    img: "https://placehold.co/300x300/e2e8f0/1e293b?text=Earbuds",
    rating: 4.5,
    reviews: 36
  },
  { 
    id: 3, 
    name: "4K Smart TV 55\"", 
    price: "$699", 
    img: "https://placehold.co/300x300/e2e8f0/1e293b?text=Smart+TV",
    rating: 4.7,
    reviews: 24
  },
  { 
    id: 4, 
    name: "Wireless Keyboard", 
    price: "$89", 
    img: "https://placehold.co/300x300/e2e8f0/1e293b?text=Keyboard",
    rating: 4.6,
    reviews: 31
  },
  { 
    id: 5, 
    name: "Smart Watch Pro", 
    price: "$249", 
    img: "https://placehold.co/300x300/e2e8f0/1e293b?text=Smart+Watch",
    rating: 4.9,
    reviews: 56
  },
  { 
    id: 6, 
    name: "Bluetooth Speaker", 
    price: "$129", 
    img: "https://placehold.co/300x300/e2e8f0/1e293b?text=Speaker",
    rating: 4.4,
    reviews: 28
  }
];

const ProductCard = ({ product }) => (
  <div
    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col relative group h-full"
    style={{ transform: 'translateZ(0)' }} // Hardware acceleration for smoother animations
  >
    {/* Best Seller Badge */}
    <div className="absolute top-4 left-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-bold px-3 py-1.5 rounded-full z-10 shadow-sm transform transition-transform duration-300 group-hover:scale-105">
      BEST SELLER
    </div>
    
    {/* Product Image Container */}
    <div className="w-full h-64 overflow-hidden">
      <img
        src={product.img}
        alt={product.name}
        className="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-110"
      />
    </div>
    
    {/* Product Info */}
    <div className="p-6 flex flex-col flex-grow">
      <h4 className="font-semibold text-lg text-neutral-800 mb-2 group-hover:text-primary-600 transition-colors duration-300">
        {product.name}
      </h4>
      
      {/* Rating */}
      <div className="flex items-center mb-3">
        <div className="flex text-yellow-400">
          {[...Array(5)].map((_, i) => {
            // Calculate partial stars for more accurate ratings
            const starValue = product.rating - i;
            return (
              <span key={i} className="relative">
                {/* Full or partial star */}
                {starValue >= 1 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ) : starValue > 0 && starValue < 1 ? (
                  <div className="relative">
                    {/* Empty star background */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-200" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {/* Partial fill overlay */}
                    <div 
                      className="absolute top-0 left-0 overflow-hidden text-yellow-400" 
                      style={{ width: `${starValue * 100}%` }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-200" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                )}
              </span>
            );
          })}
        </div>
        <span className="text-sm text-neutral-500 ml-2 font-medium">{product.reviews} reviews</span>
      </div>
      
      {/* Price */}
      <div className="mt-auto">
        <p className="text-primary-600 font-bold text-xl">{product.price}</p>
        
        {/* Add to Cart Button */}
        <button className="mt-4 w-full bg-primary-500 text-white py-2.5 px-4 rounded-lg hover:bg-primary-600 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center group-hover:shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
          </svg>
          Add to Cart
        </button>
      </div>
    </div>
  </div>
);

const BestSellers = () => (
  <section className="py-16 bg-gradient-to-b from-white to-neutral-50">
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-bold text-neutral-900">Best Sellers</h2>
          <p className="text-neutral-600 mt-2">Our most popular products based on sales</p>
        </div>
        <button className="text-primary-500 font-medium hover:text-primary-600 flex items-center group">
          <span className="transition-all duration-300 group-hover:mr-1">View All</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {/* Responsive grid: 1 column on extra small screens, 2 columns on small screens, 3 columns on large screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {bestSellers.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  </section>
);

export default BestSellers;
