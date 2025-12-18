const mongoose = require("mongoose");
const order = require("../../Models/order");
const cart = require("../../Models/cart");
const category = require("../../Models/category");
const usertable = require("../../Models/usertable");

const extractCategoryIds = (rawValue) => {
  if (!Array.isArray(rawValue) || rawValue.length === 0) {
    return [];
  }
  return rawValue
    .flatMap((entry) => {
      if (!entry) {
        return [];
      }
      if (typeof entry === "string") {
        return entry
          .split(",")
          .map((id) => id.trim())
          .filter((id) => id.length > 0);
      }
      return [String(entry)];
    })
    .filter((value) => value.length > 0);
};

const buildDateSeries = (startDate, days) => {
  const series = [];
  for (let index = 0; index < days; index += 1) {
    const current = new Date(startDate.getTime());
    current.setDate(current.getDate() + index);
    current.setHours(0, 0, 0, 0);
    series.push(current.toISOString().slice(0, 10));
  }
  return series;
};

const orderAnalytics = async (req, res) => {
  try {
    let days = Number(req.query.days) || 7;
    if (!Number.isFinite(days) || days < 1) {
      days = 7;
    }
    if (days > 90) {
      days = 90;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(today.getTime());
    startDate.setDate(startDate.getDate() - (days - 1));

    const dateSeries = buildDateSeries(startDate, days);

    const orderAggregation = await order.aggregate([
      {
        $addFields: {
          effectiveDate: {
            $cond: [
              { $eq: [{ $type: "$order_date" }, "date"] },
              "$order_date",
              {
                $cond: [
                  { $eq: [{ $type: "$createdAt" }, "date"] },
                  "$createdAt",
                  new Date(0),
                ],
              },
            ],
          },
        },
      },
      {
        $match: {
          effectiveDate: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$effectiveDate" },
          },
          totalSales: {
            $sum: {
              $cond: [
                { $in: ["$payment_status", ["received", "success"]] },
                { $ifNull: ["$grand_total_amount", 0] },
                0,
              ],
            },
          },
          orderCount: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const orderMap = new Map(
      orderAggregation.map((entry) => [entry._id, entry])
    );

    const dayWiseSales = dateSeries.map((dateKey) => ({
      date: dateKey,
      totalSales: Number(orderMap.get(dateKey)?.totalSales || 0),
    }));

    const dayWiseOrders = dateSeries.map((dateKey) => ({
      date: dateKey,
      totalOrders: Number(orderMap.get(dateKey)?.orderCount || 0),
    }));

    const userAggregationBase = await usertable.aggregate([
      {
        $addFields: {
          effectiveCreated: {
            $cond: [
              { $eq: [{ $type: "$createdAt" }, "date"] },
              "$createdAt",
              {
                $cond: [
                  { $eq: [{ $type: "$createdAt" }, "string"] },
                  {
                    $dateFromString: {
                      dateString: "$createdAt",
                      onError: new Date(0),
                      onNull: new Date(0),
                    },
                  },
                  new Date(0),
                ],
              },
            ],
          },
        },
      },
      {
        $project: {
          effectiveCreated: 1,
        },
      },
    ]);

    const initialUserCount = userAggregationBase.filter(
      (entry) => entry.effectiveCreated < startDate
    ).length;

    const userAggregation = await usertable.aggregate([
      {
        $addFields: {
          effectiveCreated: {
            $cond: [
              { $eq: [{ $type: "$createdAt" }, "date"] },
              "$createdAt",
              {
                $cond: [
                  { $eq: [{ $type: "$createdAt" }, "string"] },
                  {
                    $dateFromString: {
                      dateString: "$createdAt",
                      onError: new Date(0),
                      onNull: new Date(0),
                    },
                  },
                  new Date(0),
                ],
              },
            ],
          },
        },
      },
      {
        $match: {
          effectiveCreated: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$effectiveCreated" },
          },
          registrations: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const userMap = new Map(
      userAggregation.map((entry) => [entry._id, entry.registrations])
    );

    let runningTotalUsers = initialUserCount;
    const cumulativeUsers = dateSeries.map((dateKey) => {
      runningTotalUsers += Number(userMap.get(dateKey) || 0);
      return {
        date: dateKey,
        totalUsers: runningTotalUsers,
      };
    });

    const confirmedItems = await cart
      .find({ orderstatus: "confirmed", orderid: { $ne: null } })
      .select("product_id product_variant_id product_qty")
      .populate({
        path: "product_id",
        select: "parent_category child_category",
      })
      .populate({
        path: "product_variant_id",
        select: "product_id",
        populate: {
          path: "product_id",
          select: "parent_category child_category",
        },
      })
      .lean();

    const categoryTotals = new Map();

    confirmedItems.forEach((item) => {
      let baseProduct = item.product_id;
      if (!baseProduct && item.product_variant_id) {
        baseProduct = item.product_variant_id.product_id || null;
      }
      if (!baseProduct) {
        return;
      }
      const parentIds = extractCategoryIds(baseProduct.parent_category);
      const categoryId = parentIds[0];
      if (!categoryId) {
        return;
      }
      const quantity = Number(item.product_qty || 0);
      const currentTotal = categoryTotals.get(categoryId) || 0;
      categoryTotals.set(categoryId, currentTotal + quantity);
    });

    const sortedCategoryEntries = Array.from(categoryTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    const categoryObjectIds = sortedCategoryEntries
      .map(([categoryId]) =>
        mongoose.Types.ObjectId.isValid(categoryId)
          ? new mongoose.Types.ObjectId(categoryId)
          : null
      )
      .filter((value) => value !== null);

    const categoryDocs = await category
      .find({ _id: { $in: categoryObjectIds } })
      .select("name")
      .lean();

    const nameLookup = new Map(
      categoryDocs.map((doc) => [String(doc._id), doc.name || "Uncategorized"])
    );

    const topCategories = sortedCategoryEntries.map(([categoryId, total]) => ({
      categoryId,
      name: nameLookup.get(categoryId) || "Uncategorized",
      totalQuantity: total,
    }));

    res.json({
      status: "successfully",
      dayWiseSales,
      dayWiseOrders,
      cumulativeUsers,
      topCategories,
    });
  } catch (error) {
    console.error("Failed to fetch order analytics", error);
    res.status(500).json({
      status: "failed",
      message: "Unable to fetch order analytics",
      error: error.message,
    });
  }
};

module.exports = orderAnalytics;
