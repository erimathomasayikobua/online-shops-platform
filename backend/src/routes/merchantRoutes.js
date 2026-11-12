'use strict';

const express = require('express');
const shopRepository = require('../repositories/shopRepository');
const productRepository = require('../repositories/productRepository');
const orderRepository = require('../repositories/orderRepository');
const chatRepository = require('../repositories/chatRepository');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

const resolveShopId = async (req) =>
  req.query.shopId || req.body.shopId || (await shopRepository.getDefaultShopId());

router.get(
  '/overview',
  asyncHandler(async (req, res) => {
    const shopId = await resolveShopId(req);
    const shop = shopId ? await shopRepository.findShopById(shopId) : null;

    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    const [products, orders, totals] = await Promise.all([
      productRepository.listByShop(shop.id),
      orderRepository.listOrders({ shopId: shop.id }),
      orderRepository.getTotals({ shopId: shop.id }),
    ]);

    return res.json({
      shop,
      metrics: {
        revenue: totals.revenue,
        orders: orders.length,
        products: products.length,
        lowStock: products.filter((product) => product.stock < productRepository.LOW_STOCK_THRESHOLD)
          .length,
      },
      products,
      orders,
    });
  })
);

router.get(
  '/chats',
  asyncHandler(async (req, res) => {
    const shopId = await resolveShopId(req);

    if (!shopId) {
      return res.json([]);
    }

    const [chats, shop] = await Promise.all([
      chatRepository.listByShop(shopId),
      shopRepository.findShopById(shopId),
    ]);

    res.json(chats.map((chat) => ({ ...chat, shop })));
  })
);

router.post(
  '/chats/messages',
  asyncHandler(async (req, res) => {
    const text = String(req.body.text || '').trim();

    if (!text) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    const shopId = await resolveShopId(req);

    if (!shopId) {
      return res.status(400).json({ message: 'A shop is required to start a conversation' });
    }

    const shop = await shopRepository.findShopById(shopId);
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    const result = await chatRepository.addMessage({
      shopId,
      customer: req.body.customer || 'Guest Customer',
      chatId: req.body.chatId,
      sender: req.body.sender,
      text,
      status: req.body.status,
    });

    res.status(201).json(result);
  })
);

module.exports = router;
