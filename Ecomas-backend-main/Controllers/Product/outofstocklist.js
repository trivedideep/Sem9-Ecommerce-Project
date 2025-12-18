const Product = require("../../Models/product");

const outOfStockList = async (req, res) => {
  try {
    const outOfStockProducts = await Product.find({ stock: { $lte: 0 } })
      .select("product_name stock product_image1")
      .sort({ product_name: 1 });

    res.status(200).send({ status: "success", data: outOfStockProducts });
  } catch (error) {
    console.error("Failed to fetch out of stock products", error);
    res.status(500).send({ status: "failed", errors: error.message });
  }
};

module.exports = outOfStockList;
