"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { sendOrderConfirmationEmail } from "../../actions/email";

// Define TypeScript interfaces for product data and cart items
interface Product {
  _id?: string;
  title: string;
  sku: string;
  description: string;
  qty: number;
  price: number;
  images: string[];
  merchant: string;
  createdAt: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function Checkout() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState("");
  
  // Calculate total price
  const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const shippingCost = 5.99;
  const taxRate = 0.08; // 8% tax
  const taxAmount = cartTotal * taxRate;
  const orderTotal = cartTotal + shippingCost + taxAmount;

  // Load cart from localStorage when component mounts
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading checkout...</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="mb-6">Looks like you haven&apos;t added any items to your cart yet.</p>
          <Link href="/shop/catalog" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors inline-block">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">SimpleShop</Link>
          <Link href="/shop/catalog" className="text-blue-600 hover:underline">
            ← Back to Catalog
          </Link>
        </div>
      </header>

      {/* Checkout Content */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              {/* Cart Items Preview */}
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.product._id || item.product.sku} className="flex items-center border-b pb-4">
                    <div className="relative h-20 w-20 flex-shrink-0">
                      <Image 
                        src={item.product.images[0]} 
                        alt={item.product.title}
                        fill
                        style={{ objectFit: "cover" }}
                        className="rounded"
                      />
                    </div>
                    <div className="ml-4 flex-grow">
                      <h3 className="font-medium">{item.product.title}</h3>
                      <p className="text-gray-600 text-sm">${item.product.price.toFixed(2)} × {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Total */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Order Total</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>${shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${orderTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError(e.target.value ? "" : "Email is required");
                  }}
                  onBlur={() => {
                    if (!email) {
                      setEmailError("Email is required");
                    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
                      setEmailError("Please enter a valid email address");
                    } else {
                      setEmailError("");
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-md ${
                    emailError ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  placeholder="your.email@example.com"
                  required
                />
                {emailError && (
                  <p className="mt-1 text-sm text-red-500">{emailError}</p>
                )}
              </div>
              
              <button 
                className={`w-full py-3 rounded-md transition-colors mt-4 ${
                  !email || emailError || isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
                onClick={async () => {
                  if (!email || emailError || isSubmitting) return;
                  
                  setIsSubmitting(true);
                  
                  try {
                    // Prepare order details for email
                    const orderItems = cart.map(item => ({
                      title: item.product.title,
                      price: item.product.price,
                      quantity: item.quantity
                    }));
                    
                    // Send confirmation email
                    const result = await sendOrderConfirmationEmail(email, {
                      items: orderItems,
                      subtotal: cartTotal,
                      shipping: shippingCost,
                      tax: taxAmount,
                      total: orderTotal
                    });
                    
                    if (result.success) {
                      // Show success popup and clear cart
                      setShowSuccessPopup(true);
                      localStorage.removeItem('cart');
                    } else {
                      alert(`Failed to send confirmation email: ${result.error}`);
                    }
                  } catch (error) {
                    console.error("Error during checkout:", error);
                    alert("An error occurred during checkout. Please try again.");
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                disabled={!email || !!emailError || isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Complete Purchase"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full border-1 border-black-500" >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
              <p className="text-gray-600 mb-6">Order details have been sent to {email}.</p>
              <Link 
                href="/shop/catalog"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors inline-block"
                onClick={() => setShowSuccessPopup(false)}
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
