const product = require("../../../Models/product");
const Review = require("../../../Models/review");

const frontendproductlistbycategory = async (req, res) => {
  const { none, page, max_price, min_price, order, orderby, brand, size, color, weight } =
    req.query;
  try {
    const categoryId = req.params.id;
    const itemsPerPage = 12;
    const pageNumber = parseInt(page) || 1;
    const skip = (pageNumber - 1) * itemsPerPage;
    let sortOptions = {};
    if (orderby) {
      if (orderby == "trendingproduct") {
        sortOptions[orderby] = 1;
      }
      if (orderby == "newarrivedproduct") {
        sortOptions[orderby] = 1;
      }

      if (orderby == "selling_price") {
        sortOptions[orderby] = order === "ASE" ? 1 : -1;
      }
    } else {
      sortOptions['selling_price'] = 1;
    }

    // Build the base query for finding products by category
    const baseQuery = {
      $or: [{ parent_category: categoryId }, { child_category: categoryId }],
    };

    // Add price filtering to the base query
    if (min_price || max_price) {
      baseQuery.selling_price = {};
      if (min_price) baseQuery.selling_price.$gte = parseInt(min_price);
      if (max_price) baseQuery.selling_price.$lte = parseInt(max_price);
    }

    if (weight) {
      const [weightnum, weighttype] = weight.split(' ');
      baseQuery.weight = weightnum;
      baseQuery.weight_type = weighttype;
    }
    if (color) baseQuery.color = color;
    if (size) baseQuery.size = size;
    if (brand) baseQuery.brand = brand;

    // Get total count before applying filters
    const totalCountBeforeFilter = await product.countDocuments(baseQuery);

    // Get products before applying filters
    const productsBeforeFilter = await product
      .find(baseQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(itemsPerPage);

    const productIds = productsBeforeFilter.map((item) => item._id);
    let ratingSummaryMap = new Map();

    if (productIds.length) {
      const ratingSummary = await Review.aggregate([
        { $match: { productId: { $in: productIds } } },
        {
          $group: {
            _id: "$productId",
            averageRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
          },
        },
      ]);

      ratingSummaryMap = ratingSummary.reduce((map, summary) => {
        map.set(summary._id.toString(), {
          averageRating: Number(summary.averageRating.toFixed(1)),
          totalReviews: summary.totalReviews,
        });
        return map;
      }, new Map());
    }

    const productsWithRatings = productsBeforeFilter.map((item) => {
      const summary = ratingSummaryMap.get(item._id.toString()) || {
        averageRating: 0,
        totalReviews: 0,
      };

      return {
        ...item.toObject(),
        averageRating: summary.averageRating,
        totalReviews: summary.totalReviews,
      };
    });

    const totalItems = totalCountBeforeFilter;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    res.status(200).json({
      status: "success",
      data: productsWithRatings,
      totalPages,
      itemsPerPage,
      totalItems,
      pageNumber,
    });

  } catch (error) {
    res.status(500).json({ status: "failed", error: error.message });
  }
};

module.exports = frontendproductlistbycategory;
