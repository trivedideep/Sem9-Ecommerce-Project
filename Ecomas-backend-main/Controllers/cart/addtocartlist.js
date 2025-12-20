
const cart = require("../../Models/cart");
const Tax = require("../../Models/tax");

const roundCurrency = (amount = 0) => {
  return Math.round((Number(amount) || 0) * 100) / 100;
};

// Use the same selection rule as order creation: latest active tax effective on/before today. If none, return 0%.
const getApplicableTax = async (today = new Date()) => {
  const applicableTax = await Tax.findOne({
    isActive: true,
    effective_from: { $lte: today }
  }).sort({ effective_from: -1, createdAt: -1 });

  if (!applicableTax) {
    return { name: "GST", percentage: 0, effective_from: null };
  }

  return {
    name: applicableTax.name || "GST",
    percentage: applicableTax.percentage || 0,
    effective_from: applicableTax.effective_from || null,
  };
};

const addtocartlist = async (req, res) => {
  try {
    const user_id = req.user.id;
    const userCart = await cart.find({ user_id, orderstatus: 'add to cart' }).populate('user_id', 'name email mobile').populate('product_variant_id', 'product_name product_image1 description selling_price mrp_price weight weighttype stock').populate('product_id', 'product_name product_image1 description selling_price mrp_price weight weighttype stock');

    if (!userCart) {
      return res.status(404).json({ message: 'User cart is Empty' });
    }

    // Calculate total amount and total item number
    let total_Amount_with_discount = 0;
    let total_Amount_without_discount = 0;
    let totalItems = 0;
    let totalDiscount = 0;

    userCart.forEach((cartItem) => {
      total_Amount_with_discount += cartItem.product_qty * (cartItem.product_variant_id == null ? cartItem.product_id.selling_price : cartItem.product_variant_id.selling_price); // Assuming 'selling_price' is the key for the product price
      total_Amount_without_discount += cartItem.product_qty * (cartItem.product_variant_id == null ? cartItem.product_id.mrp_price : cartItem.product_variant_id.mrp_price); // Assuming 'selling_price' is the key for the product price
      totalItems += cartItem.product_qty;
      const discount = (cartItem.product_variant_id == null ? cartItem.product_id.mrp_price : cartItem.product_variant_id.mrp_price) - (cartItem.product_variant_id == null ? cartItem.product_id.selling_price : cartItem.product_variant_id.selling_price);
      totalDiscount += discount * cartItem.product_qty;
    });

    const subtotal = roundCurrency(total_Amount_with_discount);

    const { name: taxName, percentage: taxPercentage } = await getApplicableTax(new Date());
    const taxRate = (Number(taxPercentage) || 0) / 100;
    const gstAmount = roundCurrency(subtotal * taxRate);
    const subtotalWithGst = roundCurrency(subtotal + gstAmount);
    const shipping_charges = calculateFifteenPercent(subtotal);
    const totalPayable = roundCurrency(subtotalWithGst + shipping_charges);

    res.status(200).send({
      data: userCart,
      subtotal,
      gstAmount,
      gstRate: taxRate,
      gstPercentage: taxPercentage,
      gstName: taxName,
      totalAmount: subtotalWithGst,
      totalPayable,
      total_Amount_with_discount_subtotal: subtotal,
      total_Amount_with_discount: totalPayable,
      total_Amount_without_discount,
      totalItems,
      totalDiscount,
      shipping_charges,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }


}


function calculateFifteenPercent(totalAmount) {
  return roundCurrency(totalAmount * 0.15);
}

module.exports = addtocartlist