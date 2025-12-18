import React, { useMemo, useState } from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useGetOrderByIdQuery } from "../store/api/orderapi";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
});

const formatCurrency = (value) => currencyFormatter.format(Number(value || 0));

const formatDate = (value) => {
    if (!value) return "--";
    const normalized =
        typeof value === "string" && value.includes("Time")
            ? value.split("Time")[0]
            : value;
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) return "--";
    return date.toLocaleDateString("en-GB");
};

const statusMeta = {
    delivered: { label: "Delivered", icon: "/images/icon/success.png" },
    shipped: { label: "Shipped", icon: "/images/icon/onway.png" },
    processing: { label: "Processing", icon: "/images/icon/onway.png" },
    pending: { label: "Pending", icon: "/images/icon/onway.png" },
};

const resolveProductData = (item) => {
    const variant = item?.product_variant_id || {};
    const product = item?.product_id || {};
    const source = Object.keys(variant).length ? variant : product;

    const name = source.product_name || item?.product_name || "Product";
    const image = source.product_image1 || "";
    const unitPrice = Number(
        source.selling_price ?? item?.selling_price ?? item?.price ?? 0
    );
    const productId =
        item?.product_id?._id ||
        item?.product_id ||
        variant?.product_id?._id ||
        variant?.product_id ||
        product?._id ||
        source?.product_id?._id ||
        source?.product_id ||
        source?._id ||
        item?.product?._id ||
        item?.productId;

    return { name, image, unitPrice, productId };
};

const OrderHistoryDetails = () => {
    const [showTax, setShowTax] = useState(false);
    const navigate = useNavigate();
    const { orderId: orderIdParam } = useParams();
    const location = useLocation();
    const orderId = orderIdParam || location.state?.orderId;

    const { data, isLoading, isError } = useGetOrderByIdQuery(orderId, {
        skip: !orderId,
    });

    const order = data?.data;
    const items = data?.existingCartItem || [];
    const trackingId = order?._id || orderId;

    const totalItems = useMemo(
        () => items.reduce((sum, item) => sum + (item?.product_qty || 0), 0),
        [items]
    );

    const subtotal = useMemo(
        () =>
            items.reduce((sum, item) => {
                const { unitPrice } = resolveProductData(item);
                return sum + unitPrice * (item?.product_qty || 0);
            }, 0),
        [items]
    );

    const discount = Number(order?.coupon_amount || 0);
    const shipping = Number(order?.shipping_charges || 0);
    const tax = Number(order?.tax_amount || 0);
    const grandTotal = Number(
        order?.grand_total_amount || subtotal + shipping - discount + tax
    );

    const statusKey = order?.order_status?.toLowerCase?.() || "pending";
    const status = statusMeta[statusKey] || {
        label: order?.order_status || "--",
        icon: "./images/icon/onway.png",
    };

    const statusDate = formatDate(order?.updatedAt);
    const orderDate = formatDate(order?.order_date);

    const addressLines = [
        order?.shipping_address1,
        order?.shipping_address2,
        order?.shipping_city,
        order?.shipping_state,
        order?.shipping_pincode,
    ]
        .filter(Boolean)
        .join(", ");

    return (
        <>
            <Header />
            <section className="section-big-py-space b-g-light  marginfromtop">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-8">
                            <div className="table-responsive hist" style={{ borderRadius: "6px" }}>
                                <h5
                                    style={{
                                        padding: "9px 9px",
                                        fontWeight: 400,
                                        fontSize: 14,
                                        paddingBottom: "20px",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => navigate(-1)}
                                >
                                    <img src="/images/icon/Arrow 1.png" alt="" /> Back to Shop
                                </h5>

                                {isLoading ? (
                                    <div className="py-5 text-center">Loading order details...</div>
                                ) : isError || !order ? (
                                    <div className="py-5 text-center">Unable to load order information.</div>
                                ) : (
                                    <>
                                        <div>
                                            <h4
                                                className="Orderstatus addmedia"
                                                style={{
                                                    width: "100%",
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    padding: "0px 9px",
                                                    fontWeight: 700,
                                                    fontSize: "13px",
                                                    paddingBottom: "20px",
                                                    paddingTop: "10px",
                                                }}
                                            >
                                                Order Id: {order.orderid}
                                                <span style={{ display: "block", color: "black" }}>
                                                    Order Status: {" "}
                                                    <img src={status.icon} alt={status.label} /> {status.label}
                                                    {statusDate !== "--" ? ` on ${statusDate}` : ""}
                                                </span>
                                            </h4>
                                            {trackingId ? (
                                                <div className="track-order-wrapper">
                                                    <button
                                                        type="button"
                                                        className="track-order-btn"
                                                        onClick={() => navigate(`/order-tracking/${trackingId}`)}
                                                    >
                                                        Track Order
                                                    </button>
                                                </div>
                                            ) : null}
                                        </div>

                                        <table className="table">
                                            <thead className="two">
                                                <tr className="three">
                                                    <th className="family px-3" style={{ fontWeight: 600, fontSize: "14px" }}>
                                                        Image
                                                    </th>
                                                    <th className="family px-3" style={{ fontWeight: 600, fontSize: "14px" }}>
                                                        Product Name
                                                    </th>
                                                    <th className="family px-3" style={{ fontWeight: 600, fontSize: "14px" }}>
                                                        Price
                                                    </th>
                                                    <th className="family px-3" style={{ fontWeight: 600, fontSize: "14px" }}>
                                                        Quantity
                                                    </th>
                                                    <th className="family px-3" style={{ fontWeight: 600, fontSize: "14px" }}>
                                                        Total
                                                    </th>
                                                    <th className="family px-3" style={{ fontWeight: 600, fontSize: "14px" }}>
                                                        Review
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {items.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={6} style={{ textAlign: "center", padding: "2rem 0" }}>
                                                            No products were found for this order.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    items.map((item) => {
                                                        const { name, image, unitPrice, productId } = resolveProductData(item);
                                                        const quantity = item?.product_qty || 0;
                                                        const lineTotal = unitPrice * quantity;
                                                        const imageUrl = image
                                                            ? `http://localhost:8000/uploads/images/${image}`
                                                            : "";

                                                        return (
                                                            <tr key={item?._id || `${name}-${quantity}`}>
                                                                <td className="px-3" style={{ width: "120px" }}>
                                                                    {imageUrl ? (
                                                                        <img
                                                                            src={imageUrl}
                                                                            width="80"
                                                                            alt={name}
                                                                            className="img-fluid"
                                                                            style={{ borderRadius: "6px" }}
                                                                        />
                                                                    ) : (
                                                                        <span style={{ color: "#8f9091" }}>--</span>
                                                                    )}
                                                                </td>
                                                                <td className="pnwidth px-3">
                                                                    <span
                                                                        style={{
                                                                            color: "black",
                                                                            fontSize: "14px",
                                                                            lineHeight: "63px",
                                                                        }}
                                                                    >
                                                                        {name}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <h6
                                                                        className="td-color px-2"
                                                                        style={{ fontWeight: 400, lineHeight: "63px", fontSize: "14px" }}
                                                                    >
                                                                        {formatCurrency(unitPrice)}
                                                                    </h6>
                                                                </td>
                                                                <td
                                                                    className="px-3"
                                                                    style={{ fontWeight: 400, lineHeight: "63px", fontSize: "14px" }}
                                                                >
                                                                    <span>{quantity}</span>
                                                                </td>
                                                                <td>
                                                                    <h6
                                                                        className="td-color px-2"
                                                                        style={{
                                                                            fontWeight: 400,
                                                                            lineHeight: "63px",
                                                                            fontSize: "14px",
                                                                            color: "#059fe2",
                                                                        }}
                                                                    >
                                                                        {formatCurrency(lineTotal)}
                                                                    </h6>
                                                                </td>
                                                                <td className="px-3" style={{ textAlign: "center" }}>
                                                                    <button
                                                                        type="button"
                                                                        className="review-btn"
                                                                        onClick={() => productId && navigate(`/productdetails/${productId}`)}
                                                                        disabled={!productId}
                                                                    >
                                                                        Review
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                )}
                                            </tbody>
                                        </table>

                                        <br />
                                        {/* <h5
                                            style={{
                                                padding: "9px 9px",
                                                fontWeight: 400,
                                                fontSize: 14,
                                                paddingBottom: "20px",
                                                cursor: "pointer",
                                            }}
                                            onClick={() => navigate("/profile", { state: { id: 2 } })}
                                        >
                                            <img src="/images/Arrow 1.png" alt="" /> Back to Shop
                                        </h5> */}
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="col-md-4 mt-lg-0 mt-md-0 mt-sm-3 mt-xs-3">
                            <div className="py-2 px-2" style={{ background: "#ffff", borderRadius: 6 }}>
                                <div>
                                    <h4
                                        style={{
                                            width: "100%",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            padding: "0px 9px",
                                            fontWeight: 700,
                                            fontSize: "14px",
                                            paddingBottom: "20px",
                                            paddingTop: "10px",
                                        }}
                                    >
                                        Payment Details
                                        <span style={{ display: "block", color: "#8f9091" }}>{orderDate}</span>
                                    </h4>
                                </div>

                                <div className="firstrow px-3 d-flex justify-content-between" style={{ padding: "5px 0px" }}>
                                    <span className="family" style={{ fontWeight: 600, fontSize: "12px" }}>
                                        {totalItems} Item{totalItems === 1 ? "" : "s"}
                                    </span>
                                    <span className="family" style={{ fontWeight: 500, color: "#059fe2", fontSize: "12px" }}>
                                        {formatCurrency(subtotal)}
                                    </span>
                                </div>

                                {discount > 0 ? (
                                    <div className="firstrow px-3 d-flex justify-content-between" style={{ padding: "5px 0px" }}>
                                        <span className="family" style={{ fontWeight: 600, fontSize: "12px" }}>
                                            Discount
                                        </span>
                                        <span className="family" style={{ fontWeight: 500, color: "#059fe2", fontSize: "12px" }}>
                                            - {formatCurrency(discount)}
                                        </span>
                                    </div>
                                ) : null}

                                {shipping > 0 ? (
                                    <div className="firstrow px-3 d-flex justify-content-between" style={{ padding: "5px 0px" }}>
                                        <span className="family" style={{ fontWeight: 600, fontSize: "12px" }}>
                                            Shipping
                                        </span>
                                        <span className="family" style={{ fontWeight: 500, color: "#059fe2", fontSize: "12px" }}>
                                            {formatCurrency(shipping)}
                                        </span>
                                    </div>
                                ) : null}

                                {order?.coupon_name ? (
                                    <div className="firstrow px-3 d-flex justify-content-between" style={{ padding: "5px 0px" }}>
                                        <span className="family" style={{ fontWeight: 600, fontSize: "12px" }}>
                                            Voucher Applied
                                        </span>
                                        <span className="family" style={{ fontWeight: 500, color: "#059fe2", fontSize: "12px" }}>
                                            {order.coupon_name}
                                        </span>
                                    </div>
                                ) : null}

                                {tax > 0 ? (
                                    <div className="firstrow px-4 mx-2 py-1 d-flex justify-content-between mt-1 align-items-center">
                                        <div className="firstcontianer d-flex align-items-start" style={{ gap: 4 }}>
                                            <div className="containerimg">
                                                <img src="/images/carticon.png" alt="tax" />
                                            </div>
                                            <div>
                                                <p className="m-0" style={{ fontWeight: 400, fontSize: "12px" }}>
                                                    Taxes applied
                                                </p>
                                                <p className="m-0" style={{ color: "#8F9091", fontSize: "10px" }}>
                                                    {formatCurrency(tax)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}

                                <br />
                                <div className="firstrow px-3 pt-1 d-flex justify-content-between">
                                    <span style={{ fontWeight: 600, fontSize: "12px" }}>
                                        Order Total
                                        <span
                                            style={{ fontSize: 10, color: "#8F9091", cursor: "pointer", marginLeft: 4 }}
                                            onClick={() => setShowTax((prev) => !prev)}
                                        >
                                            (incl. taxes) {showTax ? "-" : "+"}
                                        </span>
                                        <br />
                                        {showTax && tax > 0 ? (
                                            <span style={{ fontSize: 10, color: "#8F9091" }} className="Gst" id="span2">
                                                GST on {formatCurrency(tax)}
                                            </span>
                                        ) : null}
                                    </span>

                                    <span style={{ fontWeight: 500, color: "#059fe2", fontSize: "12px" }}>
                                        {formatCurrency(grandTotal)}
                                    </span>
                                </div>

                                <br />
                                <hr />

                                <div className="firstrow px-3 d-flex justify-content-between" style={{ padding: "5px 0px" }}>
                                    <span className="family" style={{ fontWeight: 600, fontSize: "12px" }}>
                                        Payment Mode
                                    </span>
                                    <span className="family" style={{ fontWeight: 500, color: "#8F9091", fontSize: "12px" }}>
                                        {order?.payment_method === "COD" ? "Cash On Delivery" : "Online"}
                                    </span>
                                </div>
                            </div>

                            <div
                                className="py-3"
                                style={{ background: "#ffff", borderRadius: 6, marginTop: 10, paddingLeft: "20px" }}
                            >
                                <div>
                                    <h5>Delivery Address</h5>
                                    <p style={{ color: "#2B2A29", fontSize: "13px" }}>
                                        {order?.shipping_first_name} {order?.shipping_last_name}
                                    </p>
                                    <p style={{ color: "#2B2A29", fontSize: "12px", marginBottom: "0.5rem" }}>{addressLines}</p>
                                    <p style={{ color: "#2B2A29", fontSize: "12px" }}>{order?.shipping_mobile}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </>
    );
};

export default OrderHistoryDetails;

