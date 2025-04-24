const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

// Define the Product model
class Product extends Model {}
Product.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  qty: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  merchantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  sequelize,
  modelName: 'Product',
  timestamps: true
});

// Define the ProductImage model
class ProductImage extends Model {}
ProductImage.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Products',
      key: 'id'
    }
  }
}, {
  sequelize,
  modelName: 'ProductImage',
  timestamps: true
});

// Define associations
Product.hasMany(ProductImage, { as: 'images', foreignKey: 'productId' });
ProductImage.belongsTo(Product, { foreignKey: 'productId' });

module.exports = { Product, ProductImage };
