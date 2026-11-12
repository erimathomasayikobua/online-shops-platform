'use strict';

const express = require('express');
const orderRepository = require('../repositories/orderRepository');
const asyncHandler = require('../utils/asyncHandler');
const { attachShops } = require('../services/catalogView');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const orders = await orderRepository.listOrders();
    res.json(await attachShops(orders));
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const order = await orderRepository.createOrder(req.body);
    res.status(201).json(order);
  })
);

router.patch(
  '/:id/status',
  asyncHandler(async (req, res) => {
    const order = await orderRepository.updateStatus(req.params.id, req.body.status);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  })
);

router.post(
  '/:id/messages',
  asyncHandler(async (req, res) => {
    if (!req.body.text) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    const result = await orderRepository.addMessage(req.params.id, {
      sender: req.body.sender,
      text: req.body.text,
      status: req.body.status,
    });

    if (!result) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(201).json(result);
  })
);

module.exports = router;
