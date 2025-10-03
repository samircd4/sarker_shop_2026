import React, { useState } from 'react'
import { useCart } from '../context/CartContext.jsx'

const steps = ['Shipping', 'Billing', 'Review', 'Payment']

const Checkout = () => {
  const { cartItem } = useCart()
  const [currentStep, setCurrentStep] = useState(0)
  const [shipping, setShipping] = useState({ fullName: '', address: '', city: '', postalCode: '', country: '' })
  const [billing, setBilling] = useState({ fullName: '', address: '', city: '', postalCode: '', country: '' })
  const [payment, setPayment] = useState({ method: 'card', cardNumber: '', expiry: '', cvv: '' })
  const [errors, setErrors] = useState({})

  const subtotal = cartItem.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0)
  const taxRate = 0.08
  const tax = subtotal * taxRate
  const total = subtotal + tax

  const validate = () => {
    const e = {}
    if (currentStep === 0) {
      ['fullName', 'address', 'city', 'postalCode', 'country'].forEach((f) => {
        if (!shipping[f]?.trim()) e[`shipping.${f}`] = 'Required'
      })
    } else if (currentStep === 1) {
      ['fullName', 'address', 'city', 'postalCode', 'country'].forEach((f) => {
        if (!billing[f]?.trim()) e[`billing.${f}`] = 'Required'
      })
    } else if (currentStep === 3) {
      if (payment.method === 'card') {
        if (!payment.cardNumber.trim()) e['payment.cardNumber'] = 'Required'
        if (!payment.expiry.trim()) e['payment.expiry'] = 'Required'
        if (!payment.cvv.trim()) e['payment.cvv'] = 'Required'
      }
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => {
    if (!validate()) return
    setCurrentStep((s) => Math.min(s + 1, steps.length - 1))
  }
  const back = () => setCurrentStep((s) => Math.max(s - 1, 0))

  return (
    <div className="max-w-6xl mx-auto px-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-neutral-800">Checkout</h1>

      {/* Stepper */}
      <div className="flex items-center justify-between mb-6">
        {steps.map((label, idx) => (
          <div key={label} className="flex-1 flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${idx <= currentStep ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}`}>{idx + 1}</div>
            <span className="ml-2 text-sm font-medium text-gray-700">{label}</span>
            {idx < steps.length - 1 && <div className={`flex-1 h-[2px] ml-3 ${idx < currentStep ? 'bg-purple-600' : 'bg-gray-200'}`}></div>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 bg-white border rounded-lg p-4">
          {currentStep === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-neutral-800">Shipping Information</h2>
              {['fullName','address','city','postalCode','country'].map((f) => (
                <div key={f}>
                  <label className="block text-sm text-gray-600 mb-1 capitalize">{f}</label>
                  <input
                    type="text"
                    className="w-full border rounded-md px-3 py-2"
                    value={shipping[f]}
                    onChange={(e) => setShipping({ ...shipping, [f]: e.target.value })}
                  />
                  {errors[`shipping.${f}`] && <p className="text-xs text-red-600 mt-1">{errors[`shipping.${f}`]}</p>}
                </div>
              ))}
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-neutral-800">Billing Information</h2>
              {['fullName','address','city','postalCode','country'].map((f) => (
                <div key={f}>
                  <label className="block text-sm text-gray-600 mb-1 capitalize">{f}</label>
                  <input
                    type="text"
                    className="w-full border rounded-md px-3 py-2"
                    value={billing[f]}
                    onChange={(e) => setBilling({ ...billing, [f]: e.target.value })}
                  />
                  {errors[`billing.${f}`] && <p className="text-xs text-red-600 mt-1">{errors[`billing.${f}`]}</p>}
                </div>
              ))}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-neutral-800">Order Review</h2>
              <ul className="space-y-2">
                {cartItem.map((item) => (
                  <li key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.name} × {item.quantity}</span>
                    <span className="font-medium">BDT {((item.price || 0) * (item.quantity || 0)).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-neutral-800">Payment</h2>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Method</label>
                <select
                  className="w-full border rounded-md px-3 py-2"
                  value={payment.method}
                  onChange={(e) => setPayment({ ...payment, method: e.target.value })}
                >
                  <option value="card">Credit/Debit Card</option>
                  <option value="cod">Cash on Delivery</option>
                </select>
              </div>
              {payment.method === 'card' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">Card Number</label>
                    <input type="text" className="w-full border rounded-md px-3 py-2" value={payment.cardNumber} onChange={(e) => setPayment({ ...payment, cardNumber: e.target.value })} />
                    {errors['payment.cardNumber'] && <p className="text-xs text-red-600 mt-1">{errors['payment.cardNumber']}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Expiry</label>
                    <input type="text" className="w-full border rounded-md px-3 py-2" value={payment.expiry} onChange={(e) => setPayment({ ...payment, expiry: e.target.value })} />
                    {errors['payment.expiry'] && <p className="text-xs text-red-600 mt-1">{errors['payment.expiry']}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">CVV</label>
                    <input type="text" className="w-full border rounded-md px-3 py-2" value={payment.cvv} onChange={(e) => setPayment({ ...payment, cvv: e.target.value })} />
                    {errors['payment.cvv'] && <p className="text-xs text-red-600 mt-1">{errors['payment.cvv']}</p>}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between">
            <button
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={back}
              disabled={currentStep === 0}
            >
              Back
            </button>
            <button
              className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white"
              onClick={next}
            >
              {currentStep === steps.length - 1 ? 'Place Order' : 'Next'}
            </button>
          </div>
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
              <span className="text-gray-600">Tax (8%)</span>
              <span className="font-medium">BDT {tax.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between">
              <span className="text-gray-800 font-semibold">Total</span>
              <span className="text-gray-900 font-bold">BDT {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout