import { FaStar, FaShoppingCart } from "react-icons/fa";
import { useCart } from "../context/CartContext.jsx";
import { IoFlashOutline } from "react-icons/io5";
import { Link } from 'react-router-dom'

const Product = ({ product }) => {
    const { addToCart } = useCart();
    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-full">
            <div className="relative">
                <Link to={`/products/${product.slug}`}>
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-64 object-cover"
                    />
                </Link>
                {product.is_featured && (
                    <div className="absolute top-4 right-4">
                        <IoFlashOutline className="text-purple-600 text-2xl" />
                    </div>
                )}
            </div>
            <div className="p-2 flex flex-col flex-1">
                <div className="flex items-center mb-2">
                    <div className="flex text-purple-600">
                        {[...Array(5)].map((_, i) => (
                            <FaStar
                                key={i}
                                className={i < Math.floor(product.rating) ? "text-purple-600" : "text-gray-300"}
                            />
                        ))}
                    </div>
                    <span className="text-sm text-gray-500 ml-2">({product.reviews_count})</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">
                    <Link to={`/products/${product.slug}`} className="hover:text-purple-700">
                        {product.name}
                    </Link>
                </h3>
                {/* <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p> */}
                <div className="mt-auto">
                    <div className="mb-2">
                        <span className="text-md font-bold text-primary-600">BDT {product.price}</span>
                    </div>
                    <button onClick={() => addToCart(product)} className="w-full bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg flex items-center justify-center transition-colors cursor-pointer">
                        <FaShoppingCart className="mr-2" />
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Product;
