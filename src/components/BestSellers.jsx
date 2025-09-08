// src/components/BestSellers.jsx
import React from "react";

const bestSellers = [
  { id: 1, name: "Gaming Laptop Z15", price: "$1,299", img: "/images/laptop.jpg" },
  { id: 2, name: "Noise Cancelling Earbuds", price: "$149", img: "/images/earbuds.jpg" },
  { id: 3, name: "4K Smart TV 55”", price: "$699", img: "/images/tv.jpg" },
];

const BestSellers = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
    {bestSellers.map((product) => (
      <div
        key={product.id}
        className="bg-white border rounded-xl shadow-sm hover:shadow-md transition p-4 flex flex-col items-center"
      >
        <img
          src={product.img}
          alt={product.name}
          className="w-28 h-28 object-contain mb-3"
        />
        <h4 className="font-semibold text-sm md:text-base text-center">
          {product.name}
        </h4>
        <p className="text-green-600 font-bold">{product.price}</p>
        <button className="mt-2 bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition">
          Add to Cart
        </button>
      </div>
    ))}
  </div>
);

export default BestSellers;
