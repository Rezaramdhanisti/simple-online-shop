"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import DefaultProductIcon from "../../components/DefaultProductIcon";
import { uploadMultipleImages } from '../../../lib/supabase';

// Define TypeScript interfaces
interface Product {
  title: string;
  sku: string;
  description: string;
  qty: number;
  price: number;
  images: string[];
  merchant: string;
  createdAt: string;
}

interface ProductFormData {
  title: string;
  sku: string;
  description: string;
  price: number;
  stock: number;
  images: File[];
}

export default function MerchantDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imgError, setImgError] = useState<{[key: string]: boolean | {[key: number]: boolean}}>({});
  const [formData, setFormData] = useState<ProductFormData>({
    title: "",
    sku: "",
    description: "",
    price: 0,
    stock: 0,
    images: []
  });
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    // Fetch products from API
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const response = await fetch(`${apiUrl}/api/products`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError("Failed to fetch products");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'price' || name === 'stock' 
        ? value === '' ? '' : parseFloat(value) 
        : value
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      
      // Update form data with selected files
      setFormData({
        ...formData,
        images: [...formData.images, ...filesArray]
      });
      
      // Create preview URLs for the images
      const newImageUrls = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviewUrls([...imagePreviewUrls, ...newImageUrls]);
    }
  };
  
  const removeImage = (index: number) => {
    // Create new arrays without the removed image
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    
    const newImageUrls = [...imagePreviewUrls];
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(newImageUrls[index]);
    newImageUrls.splice(index, 1);
    
    // Update state
    setFormData({
      ...formData,
      images: newImages
    });
    setImagePreviewUrls(newImageUrls);
  };

  // Then in your component:
  
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Show loading state
      setLoading(true);
      
      // Upload multiple images to Supabase if available
      let imageUrls: string[] = [];
      if (formData.images.length > 0) {
        imageUrls = await uploadMultipleImages(formData.images);
      }
      
      // Prepare image URLs for the product
      
      // Prepare form data for API
      const productData = {
        title: formData.title,
        sku: formData.sku,
        description: formData.description,
        qty: formData.stock,
        price: formData.price,
        images: imageUrls
      };

      // Get auth token from localStorage
      const token = localStorage.getItem('authToken');
      
      // Make API call to create product
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL ;
      const response = await fetch(`${apiUrl}/api/products`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(productData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const newProduct = await response.json();
      
      // Add the new product to the list
      setProducts([...products, newProduct]);
      
      // Reset form and close modal
      setFormData({
        title: "",
        sku: "",
        description: "",
        price: 0,
        stock: 0,
        images: []
      });
      
      // Clean up image preview URLs
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
      setImagePreviewUrls([]);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to add product:", err);
      setError("Failed to add product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Add New Product
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No products found. Add your first product!
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.sku} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 flex space-x-1">
                        {imgError[product.sku] || !product.images || product.images.length === 0 ? (
                          <div className="h-10 w-10 relative">
                            <DefaultProductIcon />
                          </div>
                        ) : (
                          product.images.map((imageUrl, index) => (
                            <div key={`${product.sku}-img-${index}`} className="h-10 w-10 relative">
                              <Image
                                src={imageUrl}
                                alt={`${product.title} image ${index + 1}`}
                                fill
                                className="rounded-md object-cover"
                                onError={() => {
                                  // Only mark the specific image as errored
                                  const newImgError = {...imgError};
                                  if (!newImgError[product.sku] || typeof newImgError[product.sku] === 'boolean') {
                                    newImgError[product.sku] = {};
                                  }
                                  if (typeof newImgError[product.sku] === 'object') {
                                    (newImgError[product.sku] as {[key: number]: boolean})[index] = true;
                                  }
                                  setImgError(newImgError);
                                }}
                              />
                            </div>
                          ))
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.title}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.qty > 10
                          ? "bg-green-100 text-green-800"
                          : product.qty > 0
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.qty}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0  flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto border-1 border-black-500 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Add Product</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddProduct}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">
                  SKU
                </label>
                <input
                  type="text"
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                    Qty
                  </label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="1"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Product Images
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                  required
                />
                
                {imagePreviewUrls.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <div className="w-full h-24 relative rounded-md overflow-hidden border border-gray-200">
                          <Image 
                            src={url} 
                            alt={`Product image ${index + 1}`} 
                            fill 
                            className="object-cover"
                            onError={(e) => {
                              // Replace with default icon if image fails to load
                              const target = e.target as HTMLElement;
                              if (target.parentElement) {
                                const parent = target.parentElement;
                                parent.innerHTML = '';
                                const iconContainer = document.createElement('div');
                                iconContainer.className = 'w-full h-full';
                                parent.appendChild(iconContainer);
                                
                                // Render the DefaultProductIcon
                                const iconDiv = document.createElement('div');
                                iconDiv.className = 'flex items-center justify-center bg-gray-200 text-gray-500 w-full h-full rounded-md';
                                iconContainer.appendChild(iconDiv);
                                
                                // Add simple icon placeholder
                                iconDiv.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
                              }
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
