'use strict';

const express = require('express');
const shopRepository = require('../repositories/shopRepository');
const productRepository = require('../repositories/productRepository');
const categoryRepository = require('../repositories/categoryRepository');
const asyncHandler = require('../utils/asyncHandler');
const { attachShops } = require('../services/catalogView');

const router = express.Router();

router.get(
  '/catalog',
  asyncHandler(async (req, res) => {
    const [shops, products, categories, categoryTree] = await Promise.all([
      shopRepository.listShops(),
      productRepository.listProducts(),
      categoryRepository.listCategoryNames(),
      categoryRepository.listCategories(),
    ]);

    res.json({
      shops: shops.filter((shop) => shop.status === 'active'),
      products: await attachShops(products),
      categories,
      categoryTree,
    });
  })
);

module.exports = router;
