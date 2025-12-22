import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'

const Cart = () => {
  const { cartItem, updateQuantity, deleteItem } = useCart()
  const navigate = useNavigate()

  const subtotal = cartItem.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0)
  const taxRate = 0.0
  const tax = subtotal * taxRate
  const total = subtotal + tax

  return (
    <div className="max-w-6xl mx-auto px-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-neutral-800">Shopping Cart</h1>

      {cartItem.length === 0 ? (
        <div className="bg-white border rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">Your cart is empty.</p>
          <Link to="/products" className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-md">Continue Shopping</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItem.map((item) => (
              <div key={item.id} className="bg-white border rounded-lg p-4 flex items-center gap-4">
                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm md:text-base font-semibold text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-600">BDT {item.price}</p>
                    </div>
                    <button
                      className="text-sm text-red-600 hover:text-red-700"
                      onClick={() => deleteItem(item.id)}
                      aria-label={`Remove ${item.name}`}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      aria-label="Decrease quantity"
                      className="px-2 py-1 rounded-md border border-gray-300 hover:bg-gray-50"
                      onClick={() => updateQuantity(cartItem, item.id, 'decrease')}
                    >
                      -
                    </button>
                    <span className="min-w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      aria-label="Increase quantity"
                      className="px-2 py-1 rounded-md border border-gray-300 hover:bg-gray-50"
                      onClick={() => updateQuantity(cartItem, item.id, 'increase')}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Item Total</div>
                  <div className="font-semibold">BDT {((item.price || 0) * (item.quantity || 0)).toFixed(2)}</div>
                </div>
              </div>
            ))}
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