import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'

const CartPanel = ({ open, onClose }) => {
  const { cartItem, updateQuantity, deleteItem } = useCart()
  const navigate = useNavigate()
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

  const subtotal = cartItem.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0)

  if (!showPanel) return null

  return (
    <div className="fixed inset-0 z-[60]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" aria-hidden="true" />
      <div className={`absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-xl border-l border-gray-200 ${animationClass}`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b bg-purple-600 text-white">
          <h2 className="text-lg font-semibold">Your Cart</h2>
          <button onClick={onClose} className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/20">Close</button>
        </div>
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cartItem.length === 0 && (
              <div className="text-center text-gray-500 py-12">Your cart is empty.</div>
            )}
            {cartItem.map((item) => (
              <div key={item.id} className="flex items-center gap-3 border rounded-md p-3">
                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-800">{item.name}</h4>
                    <button className="text-xs text-red-600 hover:text-red-700" onClick={() => deleteItem(item.id)}>Remove</button>
                  </div>
                  <div className="text-sm text-gray-600">BDT {item.price}</div>
                  <div className="mt-2 flex items-center gap-2">
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
              </div>
            ))}
          </div>
          <div className="border-t p-4 sticky bottom-0 bg-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-700 font-medium">Subtotal</span>
              <span className="text-gray-900 font-semibold">BDT {subtotal.toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                className="w-full px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => { onClose(); navigate('/cart'); }}
              >
                View Cart
              </button>
              <button
                className="w-full px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => { onClose(); navigate('/checkout'); }}
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPanel