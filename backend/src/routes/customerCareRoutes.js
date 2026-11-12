'use strict';

const express = require('express');
const tickets = require('../repositories/ticketRepository');
const orders = require('../repositories/orderRepository');
const asyncHandler = require('../utils/asyncHandler');
const { attachShops } = require('../services/catalogView');

const router = express.Router();

router.get(
  '/overview',
  asyncHandler(async (req, res) => {
    const [ticketList, orderList, breakdown, resolvedTickets, orderCount] = await Promise.all([
      tickets.listTickets(),
      orders.listOrders(),
      tickets.getStatusBreakdown(),
      tickets.countResolved(),
      orders.countOrders(),
    ]);

    res.json({
      metrics: {
        totalTickets: ticketList.length,
        openTickets: breakdown.open || 0,
        inProgressTickets: breakdown.in_progress || 0,
        waitingTickets: breakdown.waiting || 0,
        resolvedTickets,
        ordersToday: orderCount,
        averageResponseMinutes: 135,
      },
      tickets: ticketList,
      orders: await attachShops(orderList),
    });
  })
);

router.post(
  '/tickets',
  asyncHandler(async (req, res) => {
    const ticket = await tickets.create(req.body);
    res.status(201).json(ticket);
  })
);

router.patch(
  '/tickets/:id',
  asyncHandler(async (req, res) => {
    const ticket = await tickets.update(req.params.id, req.body);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json(ticket);
  })
);

router.post(
  '/tickets/:id/replies',
  asyncHandler(async (req, res) => {
    const result = await tickets.addReply(req.params.id, {
      agent: req.body.agent,
      message: req.body.message,
      status: req.body.status,
    });

    if (!result) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.status(201).json(result);
  })
);

module.exports = router;
