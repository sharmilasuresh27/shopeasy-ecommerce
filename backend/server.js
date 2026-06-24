const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend + images
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/image', express.static(path.join(__dirname, 'public/image')));

// API Routes
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/products',    require('./routes/products'));
app.use('/api/cart',        require('./routes/cart'));
app.use('/api/orders',      require('./routes/orders'));
app.use('/api/admin',       require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/chatbot',     require('./routes/chatbot'));
app.use('/api/analytics',   require('./routes/analytics'));

// GET seed - works from browser directly
app.get('/api/seed-now', async (req, res) => {
  try {
    const Product = require('./models/Product');
    await Product.deleteMany({});
    await Product.insertMany([
      { name: 'iPhone 15 Pro', price: 134900, originalPrice: 149900, discount: 10, description: 'A17 Pro chip, Titanium design, 48MP camera system. The most powerful iPhone ever made.', category: 'Electronics', stock: 8,  image: '/image/iphone.jpg', views: 150, sold: 45, rating: 4.8, priceHistory: [{ price: 134900, date: new Date() }]   },
      { name: 'MacBook Pro M3', price: 199900, originalPrice: 249900, discount: 20, description: '16-inch Liquid Retina XDR, M3 Pro chip, 18GB RAM, 512GB SSD. Beast of a laptop.', category: 'Electronics', stock: 4,  image: '/image/mac.jpg', views: 120, sold: 28, rating: 4.9, priceHistory: [{ price: 199900, date: new Date() }]       },
      { name: 'Dell XPS 15',    price: 129900, originalPrice: 169900, discount: 24, description: 'Intel Core i9, 32GB RAM, NVIDIA RTX 4060, OLED touch display.', category: 'Electronics', stock: 6,  image: '/image/dell.jpg', views: 95, sold: 32, rating: 4.6, priceHistory: [{ price: 129900, date: new Date() }]      },
      { name: 'HP Spectre x360',price: 109900, originalPrice: 149900, discount: 27, description: '13.5" OLED touch, Intel Evo, 16GB RAM, 360-degree hinge design.', category: 'Electronics', stock: 5,  image: '/image/hplap.jpg', views: 88, sold: 25, rating: 4.5, priceHistory: [{ price: 109900, date: new Date() }]     },
      { name: 'Samsung 4K TV',  price: 54999,  originalPrice: 74999, discount: 27, description: '55" Crystal UHD, HDR10+, Smart TV with Alexa & Google Assistant built-in.', category: 'Electronics', stock: 5,  image: '/image/samsung.jpg', views: 110, sold: 38, rating: 4.7, priceHistory: [{ price: 54999, date: new Date() }]   },
      { name: 'Sony WH-1000XM5',price: 29990,  originalPrice: 39990, discount: 25, description: 'Industry-leading noise cancellation, 30-hour battery, Hi-Res Audio. Best headphones.', category: 'Electronics', stock: 12, image: '/image/sony.jpg', views: 200, sold: 65, rating: 4.9, priceHistory: [{ price: 29990, date: new Date() }]      },
      { name: 'OnePlus 12',     price: 64999,  originalPrice: 89999, discount: 28, description: 'Snapdragon 8 Gen 3, Hasselblad camera, 100W SUPERVOOC charging, 5000mAh battery.', category: 'Electronics', stock: 15, image: '/image/oneplus.jpg', views: 175, sold: 52, rating: 4.7, priceHistory: [{ price: 64999, date: new Date() }]   },
      { name: 'Nike Air Max 270',price: 12995,  originalPrice: 17995, discount: 28, description: 'Max Air cushioning unit, breathable mesh upper, rubber outsole. Iconic comfort.', category: 'Footwear',    stock: 20, image: '/image/nike.jpg', views: 250, sold: 89, rating: 4.6, priceHistory: [{ price: 12995, date: new Date() }]      },
      { name: 'Adidas Ultraboost', price: 9999, originalPrice: 13999, discount: 29, description: 'Premium running shoes with responsive Boost cushioning and breathable mesh upper.', category: 'Footwear', stock: 18, image: '/image/adidas.jpg', views: 180, sold: 67, rating: 4.8, priceHistory: [{ price: 9999, date: new Date() }] },
      { name: 'Bata Formal Shoes', price: 3499, originalPrice: 4999, discount: 30, description: 'Elegant black formal shoes perfect for office and business wear.', category: 'Footwear', stock: 20, image: '/image/bata.jpg', views: 95, sold: 34, rating: 4.3, priceHistory: [{ price: 3499, date: new Date() }] },
      { name: 'Puma Running Shoes', price: 4999, originalPrice: 6999, discount: 29, description: 'Lightweight sports shoes designed for comfort and daily running.', category: 'Footwear', stock: 25, image: '/image/puma.jpg', views: 120, sold: 45, rating: 4.5, priceHistory: [{ price: 4999, date: new Date() }] },
      { name: 'Skechers Slip-On', price: 5999, originalPrice: 7999, discount: 25, description: 'Comfortable slip-on walking shoes with memory foam cushioning.', category: 'Footwear', stock: 15, image: '/image/sket.jpg', views: 85, sold: 28, rating: 4.4, priceHistory: [{ price: 5999, date: new Date() }] },
      { name: 'H&M Striped T-Shirt', price: 999, originalPrice: 1499, discount: 33, description: 'Casual striped t-shirt with soft cotton fabric.', category: 'Clothing', stock: 30, image: '/image/HM.jpg', views: 145, sold: 78, rating: 4.2, priceHistory: [{ price: 999, date: new Date() }] },
      { name: 'Zara Hoodie', price: 2499, originalPrice: 3499, discount: 29, description: 'Premium hoodie with comfortable fit and stylish design.', category: 'Clothing', stock: 20, image: '/image/hoodies.jpg', views: 110, sold: 42, rating: 4.6, priceHistory: [{ price: 2499, date: new Date() }] },
      { name: 'Denim Jacket', price: 3199, originalPrice: 4499, discount: 29, description: 'Classic denim jacket for casual and trendy outfits.', category: 'Clothing', stock: 15, image: '/image/jacket.jpg', views: 98, sold: 35, rating: 4.5, priceHistory: [{ price: 3199, date: new Date() }] },
      { name: 'US Polo T-Shirt', price: 1499, originalPrice: 1999, discount: 25, description: 'Premium polo t-shirt with modern fit.', category: 'Clothing', stock: 25, image: '/image/us.jpg', views: 130, sold: 56, rating: 4.4, priceHistory: [{ price: 1499, date: new Date() }] },
      { name: 'Zara Floral Frock', price: 2199, originalPrice: 2999, discount: 27, description: 'Beautiful floral frock with premium fabric and modern design.', category: 'Clothing', stock: 20, image: '/image/zarafrock.jpg', views: 75, sold: 22, rating: 4.3, priceHistory: [{ price: 2199, date: new Date() }] },
    ]);
    res.json({ ok: true, message: '17 products loaded!' });
  } catch(e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected!'))
  .catch(err => console.log('❌ MongoDB error:', err.message));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`🌱 Seed:   http://localhost:${PORT}/api/seed-now`);
});
