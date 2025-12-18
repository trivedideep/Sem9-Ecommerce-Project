const usertable = require("../../Models/usertable");
const category = require("../../Models/category");
const order = require("../../Models/order");

const countinfo = async (req, res) => {
  try {
    // Get counts
    const userCount = await usertable.countDocuments();
    const categoryCount = await category.countDocuments();
    const orderCount = await order.countDocuments();

    // Get latest 10 users
    const latestUsers = await usertable.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('first_name last_name mobile email');

    // Get latest 10 orders
    const latestOrders = await order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('orderid order_status grand_total_amount');

    res.send({
      status: "successfully",
      user: userCount,
      category: categoryCount,
      order: orderCount,
      latestUsers: latestUsers,
      latestOrders: latestOrders
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "An error occurred while fetching count info" });
  }
};

module.exports = countinfo;
