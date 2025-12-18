const express = require("express");
const authenticateToken = require("../middlewares/verifytoken");
const optionalAuth = require("../middlewares/optionalAuth");
const addReview = require("../Controllers/review/addReview");
const getProductReviews = require("../Controllers/review/getProductReviews");

const router = express.Router();

router.post("/add", authenticateToken, addReview);
router.get("/product/:productId", optionalAuth, getProductReviews);

module.exports = router;
