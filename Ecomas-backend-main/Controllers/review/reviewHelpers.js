const mongoose = require("mongoose");
const cart = require("../../Models/cart");
const productVariant = require("../../Models/product_variant");
const Review = require("../../Models/review");

const normalizeObjectId = (value) => {
  if (!value) return null;
  if (value instanceof mongoose.Types.ObjectId) return value;
  return mongoose.Types.ObjectId.isValid(value)
    ? new mongoose.Types.ObjectId(value)
    : null;
};

const userHasPurchasedProduct = async (userId, productId) => {
  const normalizedUserId = normalizeObjectId(userId);
  const normalizedProductId = normalizeObjectId(productId);

  if (!normalizedUserId || !normalizedProductId) {
    return false;
  }

  const directlyPurchased = await cart.exists({
    user_id: normalizedUserId,
    orderstatus: "confirmed",
    product_id: normalizedProductId,
  });

  if (directlyPurchased) {
    return true;
  }

  const variantCartItems = await cart
    .find({
      user_id: normalizedUserId,
      orderstatus: "confirmed",
      product_variant_id: { $ne: null },
    })
    .select("product_variant_id");

  if (!variantCartItems.length) {
    return false;
  }

  const variantIds = variantCartItems
    .map((item) => item.product_variant_id)
    .filter(Boolean);

  if (!variantIds.length) {
    return false;
  }

  const matchingVariant = await productVariant.exists({
    _id: { $in: variantIds },
    product_id: normalizedProductId,
  });

  return Boolean(matchingVariant);
};

const buildReviewSummary = async (productId, preload = null) => {
  if (Array.isArray(preload)) {
    const totalReviews = preload.length;
    const averageRating = totalReviews
      ? Number(
        (
          preload.reduce((acc, review) => acc + Number(review.rating || 0), 0) /
          totalReviews
        ).toFixed(1)
      )
      : 0;

    return { averageRating, totalReviews };
  }

  const normalizedProductId = normalizeObjectId(productId);
  if (!normalizedProductId) {
    return { averageRating: 0, totalReviews: 0 };
  }

  const summary = await Review.aggregate([
    { $match: { productId: normalizedProductId } },
    {
      $group: {
        _id: "$productId",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (!summary.length) {
    return { averageRating: 0, totalReviews: 0 };
  }

  return {
    averageRating: Number(summary[0].averageRating.toFixed(1)),
    totalReviews: summary[0].totalReviews,
  };
};

module.exports = {
  userHasPurchasedProduct,
  buildReviewSummary,
};
