import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import ItemTable from '../components/cart/ItemTable.jsx'
import EmptyCart from '../components/cart/EmptyCart.jsx'

const Cart = () => {
    const { cartItem, updateQuantity, deleteItem } = useCart()
    const navigate = useNavigate()

    const subtotal = cartItem.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0)
    const taxRate = 0.0
    const tax = subtotal * taxRate
    const total = subtotal + tax

    return (
        <div className="max-w-6xl mx-auto px-4 min-h-[60vh]">
            <h1 className="text-2xl md:text-3xl font-bold mb-8 text-neutral-800 uppercase tracking-tight">Shopping Cart</h1>

            {cartItem.length === 0 ? (
                <EmptyCart
                    title="Your cart is empty"
                    description="Looks like you haven't added any premium products to your cart yet. Let's find something amazing for you!"
                    buttonText="START SHOPPING"
                />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <ItemTable
                            items={cartItem}
                            onDecrease={(id) => updateQuantity(id, "decrease")}
                            onIncrease={(id) => updateQuantity(id, "increase")}
                            onSet={(id, qty) => updateQuantity(id, "set", qty)}
                            onRemove={(id) => deleteItem(id)}
                        />
                    </div>



                    {/* Summary */}
                    <div className="bg-white border rounded-lg p-4 h-fit">
                        <h2 className="text-lg font-semibold mb-3 text-neutral-800">Order Summary</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">BDT {subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tax ({(taxRate * 100).toFixed(0)}%)</span>
                                <span className="font-medium">BDT {tax.toFixed(2)}</span>
                            </div>
                            <div className="border-t pt-2 flex justify-between">
                                <span className="text-gray-800 font-semibold">Total</span>
                                <span className="text-gray-900 font-bold">BDT {total.toFixed(2)}</span>
                            </div>
                        </div>
                        <button
                            className="mt-4 w-full px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white"
                            onClick={() => navigate('/checkout')}
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Cart
