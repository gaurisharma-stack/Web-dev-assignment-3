const express = require('express');
const c = require('../controllers/productController');
const { validateObjectId, requireBody } = require('../middleware/validate');

const router = express.Router();

// IMPORTANT: fixed paths must come BEFORE "/:id",
// otherwise Express would treat "low-stock" / "summary" as an ID.
router.get('/low-stock', c.getLowStock);
router.get('/summary', c.getCategorySummary);

router.route('/').get(c.getProducts).post(requireBody, c.createProduct);

router
  .route('/:id')
  .get(validateObjectId, c.getProductById)
  .put(validateObjectId, requireBody, c.updateProduct)
  .delete(validateObjectId, c.deleteProduct);

router.patch('/:id/stock', validateObjectId, requireBody, c.adjustStock);

module.exports = router;
