const Order = require("../../Models/order");
const Cart = require("../../Models/cart");

const toCurrencyNumber = (value = 0) => {
  const parsed = Number(value) || 0;
  return Math.round(parsed * 100) / 100;
};

const orderlistbyuser = async (req, res) => {
  try {
    const user_id = req.user.id;

    // Fetch orders for the user
    const orderlist = await Order.find({ user_id });

    if (!orderlist || orderlist.length === 0) {
      return res.status(404).json({ status: 0, message: "No Orders Found" });
    }

    // Iterate over each order to calculate totalItems
    const ordersWithTotalItems = await Promise.all(orderlist.map(async (order) => {
      // Fetch cart items for each order
      const cartinfo = await Cart.find({ orderid: order.orderid });

      // Calculate totalItems for the order
      let totalItems = 0;
      cartinfo.forEach((cartItem) => {
        totalItems += cartItem.product_qty;
      });

      // Return order details along with totalItems
      const subtotal = order.subtotal ?? order.sub_total_amount ?? 0;
      const gstAmount = order.gstAmount ?? order.tax_amount ?? 0;
      const totalAmount = order.totalAmount ?? (subtotal + gstAmount);

      return {
        _id: order._id,
        orderid: order.orderid,
        user_name: order.user_name,
        order_date: order.order_date,
        order_status: order.order_status,
        subtotal: toCurrencyNumber(subtotal),
        gstAmount: toCurrencyNumber(gstAmount),
        totalAmount: toCurrencyNumber(totalAmount),
        shipping_charges: toCurrencyNumber(order.shipping_charges),
        grand_total_amount: toCurrencyNumber(order.grand_total_amount ?? (totalAmount + (order.shipping_charges || 0))),
        totalItems: totalItems
      };
    }));

    res.status(200).json({ status: 1, orderlist: ordersWithTotalItems });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = orderlistbyuser;
