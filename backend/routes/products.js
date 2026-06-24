const router  = require('express').Router();
const Product = require('../models/Product');
console.log(Product);

// POST /api/products/seed — MUST be before /:id route!
router.post('/seed', async (req, res) => {
  try {
    await Product.deleteMany({});
    await Product.insertMany([
      { name:'iPhone 15 Pro', price:134900, category:'Electronics', stock:8 , image:"/image/iphone.jpg"},
      { name:'Samsung Galaxy S24', price:79999, category:'Electronics', stock:10, image:"/image/samsung.jpg" },
      { name:'OnePlus 13', price:69999, category:'Electronics', stock:12, image:"/image/oneplus.jpg" },
      { name:'MacBook Air M3', price:114900, category:'Electronics', stock:6, image:"/image/mac.jpg" },
      { name:'HP Pavilion Laptop', price:65000, category:'Electronics', stock:15 ,image:"/image/hplap.jpg"},
      { name:'Dell Inspiron', price:58000, category:'Electronics', stock:11 ,image:"/image/dell.jpg"},
      { name:'Sony WH-1000XM5', price:29990, category:'Electronics', stock:20 , image:"/image/sony.jpg"},
      { name:'Boat Rockerz 550', price:1999, category:'Electronics', stock:50 ,image:"/image/boot.jpg"},

      { name:'Samsung 55 Inch TV', price:54999, category:'Electronics', stock:5 },
      { name:'LG Smart TV', price:47999, category:'Electronics', stock:7 },

      { name:'Nike Air Max 270', price:12995, category:'Footwear', stock:20, image:"/image/nike.jpg"},
      { name:'Adidas Ultraboost', price:9999, category:'Footwear', stock:18},
      { name:'Puma Running Shoes', price:4999, category:'Footwear', stock:25},

      { name:"Levi's 501 Jeans", price:3999, category:'Clothing', stock:30, image:"/image/levi.jpg"},
      { name:'Allen Solly Shirt', price:1499, category:'Clothing', stock:40, image:"/image/allen.jpg"},
      { name:'US Polo T-Shirt', price:999, category:'Clothing', stock:45 },
      { name:'Peter England Formal Shirt', price:1799, category:'Clothing', stock:35 },

      { name:'Titan Smart Watch', price:7999, category:'Accessories', stock:22 },
      { name:'Fastrack Watch', price:2499, category:'Accessories', stock:30 },

      { name:'Wildcraft Backpack', price:1999, category:'Bags', stock:28 },
      { name:'American Tourister Bag', price:3499, category:'Bags', stock:15 },

      { name:'Study Table', price:5999, category:'Furniture', stock:10 },
      { name:'Office Chair', price:7499, category:'Furniture', stock:12 },

      { name:'Prestige Cooker', price:2499, category:'Home', stock:25 },
      { name:'Philips Mixer Grinder', price:3999, category:'Home', stock:14 },

      { name:'The Alchemist', price:399, category:'Books', stock:100 },
      { name:'Atomic Habits', price:599, category:'Books', stock:80 },

      { name:'Cricket Bat', price:2499, category:'Sports', stock:16 },
      { name:'Football', price:899, category:'Sports', stock:40 }
    ]);
    res.json({ message: '6 products seeded!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products — all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id — single product (AFTER /seed)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
