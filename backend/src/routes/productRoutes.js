'use strict';

const express = require('express');
const productRepository = require('../repositories/productRepository');
const shopRepository = require('../repositories/shopRepository');
const asyncHandler = require('../utils/asyncHandler');
const { createId } = require('../utils/ids');
const { attachShops } = require('../services/catalogView');

const router = express.Router();

const DEFAULT_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80';

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { shopId, category, q } = req.query;
    const products = await productRepository.listProducts({ shopId, category, q });
    res.json(await attachShops(products));
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const shopId = req.body.shopId || (await shopRepository.getDefaultShopId());

    if (!shopId) {
      return res.status(400).json({ message: 'A shop is required before adding products' });
    }

    const product = await productRepository.create({
      id: createId('prod'),
      shopId,
      name: req.body.name,
      category: req.body.category || 'General',
      price: req.body.price || 0,
      stock: req.body.stock || 0,
      status: req.body.status || 'active',
      image: req.body.image || DEFAULT_PRODUCT_IMAGE,
    });

    res.status(201).json(product);
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const product = await productRepository.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(await productRepository.update(product.id, req.body));
  })
);

module.exports = router;
