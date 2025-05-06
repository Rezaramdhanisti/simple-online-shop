"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

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


// Product card component
function ProductCard({ product, onAddToCart }: { product: Product; onAddToCart: (product: Product) => void }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-150 w-full">
        <Image 
          src={product.images[currentImageIndex]} 
          alt={product.title}
          fill
          style={{ objectFit: "cover" }}
        />
        
        {product.images.length > 1 && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-1 hover:bg-white/90 transition-colors z-10"
              aria-label="Previous image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-1 hover:bg-white/90 transition-colors z-10"
              aria-label="Next image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
              {product.images.map((_, index) => (
                <span 
                  key={index} 
                  className={`block h-1.5 w-1.5 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold">{product.title}</h3>
        <p className="text-gray-600 mt-1">${product.price.toFixed(2)}</p>
        <div className="mt-2">
          <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
        </div>
        <div className="mt-4 flex justify-end items-center">
          <button 
            className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors"
            onClick={() => onAddToCart(product)}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);

  // Load cart from localStorage when component mounts
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
  }, []);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL ;
        const response = await fetch(`${apiUrl}/api/products`, {
          headers: {
            'ngrok-skip-browser-warning': 'true',
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError("Failed to fetch products");
        console.error(err);
        // Use fallback products if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Calculate cart count
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  
  // Calculate total price
  const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);

  // Handle clicking outside the cart to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setIsCartOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Add product to cart
  const addToCart = (product: Product) => {
    setCart(prevCart => {
      // Get a consistent product identifier
      const productId = product._id || product.sku;
      
      // Check if product already exists in cart
      const existingItem = prevCart.find(item => {
        const itemId = item.product._id || item.product.sku;
        return itemId === productId;
      });
      
      let newCart;
      if (existingItem) {
        // Increase quantity if product already in cart
        newCart = prevCart.map(item => {
          const itemId = item.product._id || item.product.sku;
          return itemId === productId
            ? { ...item, quantity: item.quantity + 1 } 
            : item;
        });
      } else {
        // Add new product to cart
        newCart = [...prevCart, { product, quantity: 1 }];
      }
      
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  // Remove product from cart
  const removeFromCart = (productId: string) => {
    setCart(prevCart => {
      const newCart = prevCart.filter(item => {
        const itemId = item.product._id || item.product.sku;
        return itemId !== productId;
      });
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  // Update product quantity
  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCart(prevCart => {
      const newCart = prevCart.map(item => {
        const itemId = item.product._id || item.product.sku;
        return itemId === productId
          ? { ...item, quantity: newQuantity } 
          : item;
      });
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">SimpleShop</Link>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button 
                className="relative focus:outline-none" 
                onClick={() => setIsCartOpen(!isCartOpen)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
              
              {/* Cart Popup */}
              {isCartOpen && (
                <div 
                  ref={cartRef}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50"
                >
                  <div className="p-4 border-b">
                    <h3 className="font-semibold text-lg">Your Cart ({cartCount} items)</h3>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {cart.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        Your cart is empty
                      </div>
                    ) : (
                      cart.map(item => (
                        <div key={item.product._id || item.product.sku} className="p-4 border-b flex items-center">
                          <div className="relative h-16 w-16 flex-shrink-0">
                            <Image 
                              src={item.product.images[0]} 
                              alt={item.product.title}
                              fill
                              style={{ objectFit: "cover" }}
                              className="rounded"
                            />
                          </div>
                          <div className="ml-4 flex-grow">
                            <h4 className="font-medium">{item.product.title}</h4>
                            <p className="text-gray-600 text-sm">${item.product.price.toFixed(2)}</p>
                          </div>
                          <div className="flex flex-col items-end">
                            <button 
                              onClick={() => removeFromCart(item.product._id || item.product.sku)}
                              className="text-red-500 text-sm mb-1"
                            >
                              Remove
                            </button>
                            <div className="flex items-center border rounded">
                              <button 
                                className="px-2 py-1 text-gray-600"
                                onClick={() => updateQuantity(item.product._id || item.product.sku, item.quantity - 1)}
                              >
                                -
                              </button>
                              <span className="px-2">{item.quantity}</span>
                              <button 
                                className="px-2 py-1 text-gray-600"
                                onClick={() => updateQuantity(item.product._id || item.product.sku, item.quantity + 1)}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {cart.length > 0 && (
                    <div className="p-4 border-t">
                      <div className="flex justify-between mb-4">
                        <span className="font-semibold">Total:</span>
                        <span className="font-semibold">${cartTotal.toFixed(2)}</span>
                      </div>
                      <Link href="/shop/checkout" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors inline-block text-center">
                        Checkout
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
            <Link href="/merchant/login" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors inline-block">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Featured Products */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Featured Products</h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 p-4 bg-red-50 rounded-lg">
              <p>{error}</p>
              <p className="mt-2 text-sm">Showing fallback products instead</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.length > 0 ? (
                products.map(product => (
                  <ProductCard 
                    key={product._id || product.sku} 
                    product={product} 
                    onAddToCart={addToCart}
                  />
                ))
              ) : (
                <div className="col-span-3 text-center text-gray-500 p-12">
                  No products found
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
