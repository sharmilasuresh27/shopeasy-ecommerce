const router = require('express').Router();
const Product = require('../models/Product');

// POST /api/chatbot/query - Process chatbot query
router.post('/query', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message)
      return res.status(400).json({ error: 'Message is required' });
    
    const msg = message.toLowerCase();
    let products = [];
    let responseText = '';
    
    // Extract price range from message
    const priceMatch = msg.match(/under\s*(\d+)/i) || msg.match(/below\s*(\d+)/i) || msg.match(/less than\s*(\d+)/i);
    const maxPrice = priceMatch ? parseInt(priceMatch[1]) : null;
    
    // Extract category from message
    const categories = ['electronics', 'footwear', 'clothing', 'accessories', 'bags', 'furniture', 'home', 'books', 'sports'];
    const detectedCategory = categories.find(cat => msg.includes(cat));
    
    // Check for discount request
    const discountRequest = msg.includes('discount') || msg.includes('offer') || msg.includes('sale');
    
    // Build query
    let query = {};
    if (detectedCategory) {
      query.category = detectedCategory.charAt(0).toUpperCase() + detectedCategory.slice(1);
    }
    if (maxPrice) {
      query.price = { $lte: maxPrice };
    }
    if (discountRequest) {
      query.discount = { $gt: 0 };
    }
    
    // Search products
    products = await Product.find(query).limit(10);
    
    // Generate response
    if (products.length === 0) {
      responseText = "I couldn't find any products matching your request. Try different keywords or price range.";
    } else {
      if (detectedCategory && maxPrice) {
        responseText = `Found ${products.length} ${detectedCategory} under ₹${maxPrice.toLocaleString('en-IN')}:`;
      } else if (detectedCategory) {
        responseText = `Found ${products.length} ${detectedCategory} products:`;
      } else if (maxPrice) {
        responseText = `Found ${products.length} products under ₹${maxPrice.toLocaleString('en-IN')}:`;
      } else if (discountRequest) {
        responseText = `Found ${products.length} discounted products:`;
      } else {
        // General search by name
        const searchTerms = msg.split(' ').filter(w => w.length > 2);
        if (searchTerms.length > 0) {
          const nameQuery = { $or: searchTerms.map(term => ({ name: { $regex: term, $options: 'i' } })) };
          products = await Product.find(nameQuery).limit(10);
          responseText = products.length > 0 ? `Found ${products.length} products matching "${message}":` : `No products found matching "${message}"`;
        } else {
          products = await Product.find().limit(5);
          responseText = "Here are some popular products:";
        }
      }
    }
    
    res.json({
      response: responseText,
      products: products.map(p => ({
        id: p._id,
        name: p.name,
        price: p.price,
        originalPrice: p.originalPrice,
        discount: p.discount,
        image: p.image,
        category: p.category,
        rating: p.rating || 4.5
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/chatbot/categories - Get available categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
