import React, { useEffect, useState } from "react";
import productsData from "../data/products.json";
import Product from "./Product";


const FeaturedProducts = () => {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    const filtered = productsData.filter((product) => product.is_featured);
    setFeatured(filtered);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {featured.map((product) => (
        <Product key={product.id} product={product} />
      ))}
    </div>
  );
};

export default FeaturedProducts;
