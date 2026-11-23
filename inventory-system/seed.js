// Optional: node seed.js  -> loads 12 sample products (matches the "total: 12" screenshot)
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const data = [
  { name: 'Study Table', sku: 'FURN-TB-812', category: 'Furniture', price: 3999, quantity: 2, reorderLevel: 4, supplier: 'IKEA India' },
  { name: 'Office Chair', sku: 'FURN-CH-101', category: 'Furniture', price: 5499, quantity: 15, reorderLevel: 5, supplier: 'Godrej' },
  { name: 'Laptop 15"', sku: 'ELEC-LP-001', category: 'Electronics', price: 55000, quantity: 3, reorderLevel: 5, supplier: 'Dell' },
  { name: 'Smartphone', sku: 'ELEC-PH-002', category: 'Electronics', price: 18000, quantity: 40, reorderLevel: 10, supplier: 'Samsung' },
  { name: 'Bluetooth Speaker', sku: 'ELEC-SP-003', category: 'Electronics', price: 2500, quantity: 4, reorderLevel: 8, supplier: 'boAt' },
  { name: 'Headphones', sku: 'ELEC-HP-004', category: 'Electronics', price: 1999, quantity: 49, reorderLevel: 10, supplier: 'Sony' },
  { name: 'T-Shirt', sku: 'APRL-TS-201', category: 'Apparel', price: 499, quantity: 60, reorderLevel: 20, supplier: 'Allen Solly' },
  { name: 'Jeans', sku: 'APRL-JN-202', category: 'Apparel', price: 2299, quantity: 18, reorderLevel: 15, supplier: 'Levis' },
  { name: 'Notebook A4', sku: 'STNY-NB-701', category: 'Stationery', price: 60, quantity: 8, reorderLevel: 25, supplier: 'Classmate' },
  { name: 'Ball Pen Box', sku: 'STNY-PN-702', category: 'Stationery', price: 150, quantity: 100, reorderLevel: 30, supplier: 'Reynolds' },
  { name: 'Basmati Rice 5kg', sku: 'GROC-RC-301', category: 'Grocery', price: 650, quantity: 70, reorderLevel: 20, supplier: 'India Gate' },
  { name: 'Olive Oil 1L', sku: 'GROC-OL-302', category: 'Grocery', price: 899, quantity: 6, reorderLevel: 10, supplier: 'Figaro' },
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Product.deleteMany();
  await Product.insertMany(data);
  console.log('Seeded', data.length, 'products');
  process.exit(0);
})();
