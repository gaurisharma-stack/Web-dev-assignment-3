require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Built-in middleware: parse JSON request bodies
app.use(express.json());

// Routes
app.get('/', (req, res) => res.json({ message: 'Inventory API is running' }));
app.use('/api/products', productRoutes);

// 404 + centralized error handler (must be LAST)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});
