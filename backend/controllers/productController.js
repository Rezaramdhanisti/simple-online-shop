const { Product, ProductImage } = require('../models/Product');

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    // Find all products and include their images
    const products = await Product.findAll({
      include: [{ model: ProductImage, as: 'images' }]
    });
    
    // Format the response
    const formattedProducts = products.map(product => {
      const productObj = product.toJSON();
      // Extract just the image URLs from the images array
      const imageUrls = productObj.images ? productObj.images.map(img => img.url) : [];
      
      return {
        id: productObj.id,
        title: productObj.title,
        sku: productObj.sku,
        description: productObj.description,
        qty: productObj.qty,
        price: Number(productObj.price),
        images: imageUrls, // Add the array of image URLs
        merchantId: productObj.merchantId,
        createdAt: productObj.createdAt
      };
    });
    
    res.status(200).json(formattedProducts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

// Create new product
exports.createProduct = async (req, res) => {
  try {
    const { title, sku, description, qty, price, images } = req.body;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized. User must be logged in to create a product' });
    }

    // Validate required fields
    if (!title || !sku || !description || !price) {
      return res.status(400).json({ message: 'Please provide all required fields: title, sku, description, and price' });
    }
    
    // Check if product with the same SKU already exists
    const existingProduct = await Product.findOne({ where: { sku } });
    if (existingProduct) {
      return res.status(400).json({ message: 'A product with this SKU already exists' });
    }
    
    // Create the product using Sequelize
    const createdProduct = await Product.create({
      title,
      sku,
      description,
      qty: qty || 0,
      price,
      merchantId: req.user.id
    });
    
    // Create product images if provided
    const productImages = [];
    if (images && images.length > 0) {
      for (const imageUrl of images) {
        const savedImage = await ProductImage.create({
          url: imageUrl,
          productId: createdProduct.id
        });
        productImages.push(savedImage);
      }
    }
    
    // Prepare response
    const imageUrls = productImages.map(img => img.url);
    
    // Create a response object
    const productResponse = {
      id: createdProduct.id,
      title: createdProduct.title,
      sku: createdProduct.sku,
      description: createdProduct.description,
      qty: createdProduct.qty,
      price: Number(createdProduct.price),
      images: imageUrls,
      merchantId: createdProduct.merchantId,
      createdAt: createdProduct.createdAt
    };
    
    res.status(201).json(productResponse);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
};
