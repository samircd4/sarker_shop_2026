import { FaStar, FaShoppingCart } from "react-icons/fa";
import { IoFlashOutline } from "react-icons/io5";

const Product = ({ product }) => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-full">
        <div className="relative">
            <img
                src={product.image}
                alt={product.name}
                className="w-full h-64 object-cover"
            />
            <div className="absolute top-4 right-4">
                <IoFlashOutline className="text-yellow-500 text-2xl" />
            </div>
        </div>
        <div className="p-2 flex flex-col flex-1">
            <div className="flex items-center mb-2">
                <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                        <FaStar
                            key={i}
                            className={i < Math.floor(product.rating) ? "text-yellow-400" : "text-gray-300"}
                        />
                    ))}
                </div>
                <span className="text-sm text-gray-500 ml-2">({product.reviews})</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
            <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
            <div className="mt-auto">
                <div className="mb-2">
                    <span className="text-md font-bold text-red-600">BDT {product.price}</span>
                </div>
                <button className="w-full bg-red-500 hover:bg-red-700 text-white p-2 rounded-lg flex items-center justify-center transition-colors cursor-pointer">
                    <FaShoppingCart className="mr-2" />
                    Add to Cart
                </button>
            </div>
        </div>
    </div>
);

export default Product;
