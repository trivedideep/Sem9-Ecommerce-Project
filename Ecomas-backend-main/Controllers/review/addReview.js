const mongoose = require("mongoose");
const Review = require("../../Models/review");
const Product = require("../../Models/product");
const { userHasPurchasedProduct, buildReviewSummary } = require("./reviewHelpers");

const addReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, rating, comment } = req.body;

    if (!productId || rating === undefined) {
      return res.status(400).json({ status: "failed", error: "Product and rating are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ status: "failed", error: "Invalid product reference" });
    }

    const numericRating = Number(rating);
    if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ status: "failed", error: "Rating must be between 1 and 5" });
    }

    const productExists = await Product.exists({ _id: productId });
    if (!productExists) {
      return res.status(404).json({ status: "failed", error: "Product not found" });
    }

    const hasPurchased = await userHasPurchasedProduct(userId, productId);
    if (!hasPurchased) {
      return res.status(403).json({ status: "failed", error: "Only customers who purchased this product can review it" });
    }

    const sanitizedComment = comment ? String(comment).trim() : "";

    let review = await Review.findOne({ userId, productId });
    const isUpdate = Boolean(review);

    if (isUpdate) {
      review.rating = numericRating;
      review.comment = sanitizedComment;
      review = await review.save();
    } else {
      review = await Review.create({ userId, productId, rating: numericRating, comment: sanitizedComment });
    }

    const summary = await buildReviewSummary(productId);

    res.status(200).json({
      status: "success",
      message: isUpdate ? "Review updated" : "Review added",
      review,
      summary,
    });
  } catch (error) {
    console.error("Error saving review", error);
    res.status(500).json({ status: "failed", error: "Unable to save review" });
  }
};

module.exports = addReview;
