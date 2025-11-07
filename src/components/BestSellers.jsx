import React, { useEffect, useState } from "react";
import productsData from "../data/products.json";
import Product from "./Product";

const BestSellers = () => {
  const [bestSellers, setBestSellers] = useState([]);

  useEffect(() => {
    // Filter products based on high ratings and review counts to identify best sellers
    const filtered = productsData
      .filter((product) => product.rating >= 4.5 && product.reviews >= 150)
      .sort((a, b) => b.reviews - a.reviews) // Sort by review count descending
      .slice(0, 5); // Take top 5 best sellers
    setBestSellers(filtered);
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {bestSellers.map((product) => (
        <Product key={product.id} product={product} />
      ))}
    </div>
  );
};

export default BestSellers;
