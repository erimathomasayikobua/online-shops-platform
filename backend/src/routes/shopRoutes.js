'use strict';

const express = require('express');
const shopRepository = require('../repositories/shopRepository');
const productRepository = require('../repositories/productRepository');
const orderRepository = require('../repositories/orderRepository');
const audit = require('../repositories/auditRepository');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await shopRepository.listShops());
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const shop = await shopRepository.findShopById(req.params.id);

    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    const [products, orders] = await Promise.all([
      productRepository.listByShop(shop.id),
      orderRepository.listOrders({ shopId: shop.id }),
    ]);

    return res.json({ ...shop, products, orders });
  })
);

router.patch(
  '/:id/status',
  asyncHandler(async (req, res) => {
    const shop = await shopRepository.findShopById(req.params.id);

    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    const updated = await shopRepository.updateStatus(shop.id, req.body.status);
    res.json(updated);
  })
);

router.patch(
  '/:id/contact',
  asyncHandler(async (req, res) => {
    const shop = await shopRepository.findShopById(req.params.id);

    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    const updated = await shopRepository.updateContact(shop.id, req.body);

    await audit.record({
      actor: req.body.actor || shop.owner,
      action: 'Updated merchant contact details',
      target: shop.name,
      ip: req.ip,
    });

    res.json(updated);
  })
);

router.patch(
  '/:id/policies',
  asyncHandler(async (req, res) => {
    const shop = await shopRepository.findShopById(req.params.id);

    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    const policy = req.body.returnPolicy || req.body;
    const updated = await shopRepository.updatePolicies(shop.id, policy);

    await audit.record({
      actor: req.body.actor || shop.owner,
      action: 'Updated merchant return policy',
      target: shop.name,
      ip: req.ip,
    });

    res.json(updated);
  })
);

module.exports = router;
