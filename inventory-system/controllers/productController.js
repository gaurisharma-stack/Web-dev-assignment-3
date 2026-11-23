const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const SORTABLE = ['name', 'sku', 'category', 'price', 'quantity', 'createdAt', 'updatedAt'];

// POST /api/products
exports.createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

// GET /api/products?category=&supplier=&search=&minPrice=&maxPrice=&lowStock=true&sort=-price,name&page=1&limit=10
exports.getProducts = asyncHandler(async (req, res) => {
  const { category, supplier, search, minPrice, maxPrice, lowStock, sort, page, limit } = req.query;

  // ---- Filtering ----
  const filter = {};
  if (category) filter.category = new RegExp(`^${escapeRegex(category)}$`, 'i');
  if (supplier) filter.supplier = new RegExp(escapeRegex(supplier), 'i');
  if (search) filter.name = new RegExp(escapeRegex(search), 'i');
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (lowStock === 'true') filter.$expr = { $lte: ['$quantity', '$reorderLevel'] };

  // ---- Sorting (whitelisted fields; "-" prefix = descending) ----
  let sortBy = '-createdAt';
  if (sort) {
    const fields = sort
      .split(',')
      .filter((f) => SORTABLE.includes(f.replace(/^-/, '')));
    if (fields.length) sortBy = fields.join(' ');
  }

  // ---- Pagination ----
  const pageNum = Math.max(parseInt(page) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  const [total, products] = await Promise.all([
    Product.countDocuments(filter),
    Product.find(filter).sort(sortBy).skip(skip).limit(limitNum),
  ]);

  res.json({
    success: true,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
    count: products.length,
    products,
  });
});

// GET /api/products/:id
exports.getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError('Product not found', 404);
  res.json(product);
});

// PUT /api/products/:id  (update details)
exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,           // return updated doc
    runValidators: true, // enforce schema rules on update
  });
  if (!product) throw new AppError('Product not found', 404);
  res.json(product);
});

// PATCH /api/products/:id/stock  body: { "change": 10 } (restock) or { "change": -3 } (sale)
exports.adjustStock = asyncHandler(async (req, res) => {
  const change = Number(req.body.change);
  if (!Number.isInteger(change) || change === 0) {
    throw new AppError('"change" must be a non-zero whole number (+ restock, - sale)', 400);
  }

  // Atomic: the condition AND the $inc happen in a single DB operation,
  // so stock can never go negative even with simultaneous requests.
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, quantity: { $gte: -change } },
    { $inc: { quantity: change } },
    { new: true, runValidators: true }
  );

  if (!product) {
    const exists = await Product.exists({ _id: req.params.id });
    if (!exists) throw new AppError('Product not found', 404);
    throw new AppError('Insufficient stock for this sale', 400);
  }

  res.json({ message: 'Stock updated', product });
});

// DELETE /api/products/:id
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new AppError('Product not found', 404);
  res.json({ message: 'Product deleted', id: product.id });
});

// GET /api/products/low-stock  -> quantity <= reorderLevel
exports.getLowStock = asyncHandler(async (req, res) => {
  const lowStockItems = await Product.find({
    $expr: { $lte: ['$quantity', '$reorderLevel'] },
  }).sort('quantity');

  res.json({ count: lowStockItems.length, lowStockItems });
});

// GET /api/products/summary  -> aggregation grouped by category
exports.getCategorySummary = asyncHandler(async (req, res) => {
  const summary = await Product.aggregate([
    {
      $group: {
        _id: '$category',
        totalItems: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' },
        totalStockValue: { $sum: { $multiply: ['$price', '$quantity'] } },
        avgPrice: { $avg: '$price' },
      },
    },
    { $sort: { totalStockValue: -1 } },
  ]);

  res.json({ categories: summary.length, summary });
});
