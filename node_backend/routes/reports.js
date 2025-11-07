const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const MenuItem = require('../models/MenuItem');
const { authenticate, authorize } = require('../middleware/auth');

// Get revenue report
router.get('/revenue', authenticate, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = { status: 'served', paymentStatus: 'paid' };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Total revenue
    const orders = await Order.find(filter);
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Revenue by date
    const revenueByDate = {};
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!revenueByDate[date]) {
        revenueByDate[date] = { date, revenue: 0, orders: 0 };
      }
      revenueByDate[date].revenue += order.totalAmount;
      revenueByDate[date].orders += 1;
    });

    // Revenue by waiter
    const revenueByWaiter = {};
    orders.forEach(order => {
      const waiterId = order.waiterId.toString();
      const waiterName = order.waiter.name;
      if (!revenueByWaiter[waiterId]) {
        revenueByWaiter[waiterId] = { 
          waiterId, 
          waiterName, 
          revenue: 0, 
          orders: 0 
        };
      }
      revenueByWaiter[waiterId].revenue += order.totalAmount;
      revenueByWaiter[waiterId].orders += 1;
    });

    // Top selling items
    const itemSales = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const itemId = item.menuItemId.toString();
        const itemName = item.menuItem.name;
        if (!itemSales[itemId]) {
          itemSales[itemId] = {
            itemId,
            itemName,
            quantity: 0,
            revenue: 0,
          };
        }
        itemSales[itemId].quantity += item.quantity;
        itemSales[itemId].revenue += item.price * item.quantity;
      });
    });

    const topSellingItems = Object.values(itemSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    res.json({
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
      },
      revenueByDate: Object.values(revenueByDate).sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      ),
      revenueByWaiter: Object.values(revenueByWaiter).sort((a, b) => 
        b.revenue - a.revenue
      ),
      topSellingItems,
    });
  } catch (error) {
    next(error);
  }
});

// Get orders report
router.get('/orders', authenticate, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(filter);

    // Orders by status
    const ordersByStatus = {
      pending: 0,
      approved: 0,
      ready: 0,
      served: 0,
      cancelled: 0,
    };

    orders.forEach(order => {
      ordersByStatus[order.status]++;
    });

    // Average preparation time
    const servedOrders = orders.filter(o => o.status === 'served' && o.approvedAt && o.readyAt);
    const avgPrepTime = servedOrders.length > 0
      ? servedOrders.reduce((sum, order) => {
          const prepTime = (order.readyAt - order.approvedAt) / 1000 / 60; // minutes
          return sum + prepTime;
        }, 0) / servedOrders.length
      : 0;

    // Average service time
    const avgServiceTime = servedOrders.length > 0
      ? servedOrders.reduce((sum, order) => {
          const serviceTime = (order.servedAt - order.createdAt) / 1000 / 60; // minutes
          return sum + serviceTime;
        }, 0) / servedOrders.length
      : 0;

    // Peak hours
    const ordersByHour = {};
    orders.forEach(order => {
      const hour = order.createdAt.getHours();
      ordersByHour[hour] = (ordersByHour[hour] || 0) + 1;
    });

    const peakHour = Object.entries(ordersByHour)
      .sort((a, b) => b[1] - a[1])[0];

    res.json({
      summary: {
        totalOrders: orders.length,
        ordersByStatus,
        averagePreparationTime: Math.round(avgPrepTime),
        averageServiceTime: Math.round(avgServiceTime),
        peakHour: peakHour ? `${peakHour[0]}:00` : 'N/A',
      },
      ordersByHour,
    });
  } catch (error) {
    next(error);
  }
});

// Get staff performance report
router.get('/staff', authenticate, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(filter);
    const waiters = await User.find({ role: 'waiter' });

    const staffPerformance = waiters.map(waiter => {
      const waiterOrders = orders.filter(o => 
        o.waiterId.toString() === waiter._id.toString()
      );
      
      const totalRevenue = waiterOrders
        .filter(o => o.status === 'served' && o.paymentStatus === 'paid')
        .reduce((sum, order) => sum + order.totalAmount, 0);

      return {
        waiterId: waiter._id,
        waiterName: waiter.name,
        totalOrders: waiterOrders.length,
        servedOrders: waiterOrders.filter(o => o.status === 'served').length,
        cancelledOrders: waiterOrders.filter(o => o.status === 'cancelled').length,
        totalRevenue,
        averageOrderValue: waiterOrders.length > 0 ? totalRevenue / waiterOrders.length : 0,
      };
    });

    res.json({
      staffPerformance: staffPerformance.sort((a, b) => b.totalRevenue - a.totalRevenue),
    });
  } catch (error) {
    next(error);
  }
});

// Get menu performance report
router.get('/menu', authenticate, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = { status: 'served' };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(filter);
    const menuItems = await MenuItem.find();

    const itemPerformance = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        const itemId = item.menuItemId.toString();
        if (!itemPerformance[itemId]) {
          itemPerformance[itemId] = {
            itemId,
            itemName: item.menuItem.name,
            category: item.menuItem.category,
            quantitySold: 0,
            revenue: 0,
            timesOrdered: 0,
          };
        }
        itemPerformance[itemId].quantitySold += item.quantity;
        itemPerformance[itemId].revenue += item.price * item.quantity;
        itemPerformance[itemId].timesOrdered += 1;
      });
    });

    const performance = Object.values(itemPerformance)
      .sort((a, b) => b.revenue - a.revenue);

    res.json({
      menuPerformance: performance,
      totalItems: menuItems.length,
      activeItems: menuItems.filter(i => i.isAvailable).length,
    });
  } catch (error) {
    next(error);
  }
});

// Get dashboard summary
router.get('/dashboard', authenticate, async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Today's orders
    const todayOrders = await Order.find({
      createdAt: { $gte: today },
    });

    // Today's revenue
    const todayRevenue = todayOrders
      .filter(o => o.status === 'served' && o.paymentStatus === 'paid')
      .reduce((sum, order) => sum + order.totalAmount, 0);

    // Active orders
    const activeOrders = await Order.countDocuments({
      status: { $in: ['pending', 'approved', 'ready'] },
    });

    // Total users
    const totalUsers = await User.countDocuments();
    const pendingApprovals = await User.countDocuments({ isApproved: false });

    res.json({
      today: {
        orders: todayOrders.length,
        revenue: todayRevenue,
        averageOrderValue: todayOrders.length > 0 ? todayRevenue / todayOrders.length : 0,
      },
      activeOrders,
      users: {
        total: totalUsers,
        pendingApprovals,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
