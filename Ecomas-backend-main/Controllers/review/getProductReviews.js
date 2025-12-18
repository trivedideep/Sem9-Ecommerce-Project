const mongoose = require("mongoose");
const Review = require("../../Models/review");
const { userHasPurchasedProduct, buildReviewSummary } = require("./reviewHelpers");

const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ status: "failed", error: "Invalid product reference" });
    }

    const reviews = await Review.find({ productId })
      .sort({ createdAt: -1 })
      .populate("userId", "first_name last_name email");

    const summary = await buildReviewSummary(productId, reviews);

    let canReview = false;
    let userReview = null;

    if (req.user && req.user.id) {
      const currentUserId = req.user.id;
      userReview = reviews.find(
        (review) => review.userId && review.userId._id && review.userId._id.toString() === currentUserId
      ) || null;
      canReview = await userHasPurchasedProduct(currentUserId, productId);
    }

    res.status(200).json({
      status: "success",
      data: {
        reviews,
        averageRating: summary.averageRating,
        totalReviews: summary.totalReviews,
        canReview,
        userReview,
      },
    });
  } catch (error) {
    console.error("Error fetching reviews", error);
    res.status(500).json({ status: "failed", error: "Unable to fetch reviews" });
  }
};

module.exports = getProductReviews;
