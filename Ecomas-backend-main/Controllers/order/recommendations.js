const mongoose = require("mongoose");
const cart = require("../../Models/cart");
const product = require("../../Models/product");

// Returns top co-purchased products for a given product based on confirmed orders
const recommendations = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    // Pull all confirmed order items with their normalized product ids
    const items = await cart
      .find({ orderstatus: "confirmed", orderid: { $ne: null } })
      .select("orderid product_id product_variant_id")
      .populate({
        path: "product_variant_id",
        select: "product_id",
      })
      .lean();

    // Map orderid -> Set of product ids within the order (normalized to base product)
    const ordersToProducts = new Map();
    items.forEach((item) => {
      const normalizedProductId = item.product_id
        ? String(item.product_id)
        : item.product_variant_id && item.product_variant_id.product_id
        ? String(item.product_variant_id.product_id)
        : null;

      if (!normalizedProductId) return;

      const set = ordersToProducts.get(item.orderid) || new Set();
      set.add(normalizedProductId);
      ordersToProducts.set(item.orderid, set);
    });

    // Count co-purchases for the target product
    const targetId = String(productId);
    const coPurchaseCounts = new Map();

    ordersToProducts.forEach((productSet) => {
      if (!productSet.has(targetId)) return;
      productSet.forEach((pid) => {
        if (pid === targetId) return;
        coPurchaseCounts.set(pid, (coPurchaseCounts.get(pid) || 0) + 1);
      });
    });

    if (coPurchaseCounts.size === 0) {
      return res.json({ productId: targetId, recommendations: [] });
    }

    const sorted = Array.from(coPurchaseCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    const recommendedIds = sorted.map(([pid]) => new mongoose.Types.ObjectId(pid));
    const products = await product
      .find({ _id: { $in: recommendedIds } })
      .select("product_name product_image1 selling_price mrp_price")
      .lean();

    const productLookup = new Map(
      products.map((p) => [String(p._id), p])
    );

    const response = sorted
      .map(([pid, score]) => ({
        product_id: pid,
        score,
        product: productLookup.get(pid) || null,
      }))
      .filter((entry) => entry.product !== null);

    return res.json({ productId: targetId, recommendations: response });
  } catch (error) {
    console.error("Error computing recommendations", error);
    return res
      .status(500)
      .json({ message: "Unable to compute recommendations", error: error.message });
  }
};

module.exports = recommendations;