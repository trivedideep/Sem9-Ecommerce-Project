import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header/Header";
import Footer from "../components/Footer";

const TIMELINE_STEPS = [
  {
    key: "pending",
    label: "Order Placed",
    info: "We have received your order and shared the confirmation email.",
  },
  {
    key: "shipped",
    label: "Shipped",
    info: "Our team has prepared your items and handed them to the courier partner.",
  },
  {
    key: "delivered",
    label: "Delivered",
    info: "Order delivered at your doorstep.",
  },
];

const formatDate = (value) => {
  if (!value) return "--";
  const normalized =
    typeof value === "string" && value.includes("Time")
      ? value.split("Time")[0]
      : value;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      setError("Missing order reference.");
      return;
    }

    const controller = new AbortController();

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("ecomustoken");
        const response = await axios.get(
          `http://localhost:8000/api/order/${orderId}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            signal: controller.signal,
          }
        );
        setOrder(response.data?.data || null);
      } catch (err) {
        if (controller.signal.aborted) return;
        const message =
          err.response?.data?.message || "Unable to fetch order details.";
        setError(message);
        setOrder(null);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchOrder();

    return () => controller.abort();
  }, [orderId]);

  const currentStatusKey = (order?.order_status || "pending").toLowerCase();
  const currentStepIndex = Math.max(
    TIMELINE_STEPS.findIndex((step) => step.key === currentStatusKey),
    0
  );

  const timeline = useMemo(
    () =>
      TIMELINE_STEPS.map((step, index) => {
        const isCurrent = index === currentStepIndex;
        const isLastStep = index === TIMELINE_STEPS.length - 1;
        let state;

        if (index < currentStepIndex) {
          state = "completed";
        } else if (isCurrent) {
          state = isLastStep ? "completed" : "active";
        } else {
          state = "upcoming";
        }

        return { ...step, state, isCurrent };
      }),
    [currentStepIndex]
  );

  return (
    <>
      <Header />
      <section className="section-big-py-space b-g-light marginfromtop">
        <div className="container order-tracking-wrapper">
          <h2 className="tracking-heading">Order Tracking</h2>

          <div className="tracking-card">
            <div className="tracking-card-header">
              <button
                type="button"
                className="tracking-back"
                onClick={() => navigate(-1)}
              >
                <img src="/images/icon/Arrow 1.png" alt="" /> Back to Orders
              </button>
            </div>
            {loading ? (
              <p className="tracking-message">Loading order status...</p>
            ) : error ? (
              <p className="tracking-error">{error}</p>
            ) : !order ? (
              <p className="tracking-error">Order not found.</p>
            ) : (
              <>
                <div className="tracking-meta">
                  <div>
                    <p>Order ID</p>
                    <h4>{order.orderid || orderId}</h4>
                  </div>
                  <div>
                    <p>Order Date</p>
                    <h4>{formatDate(order.order_date)}</h4>
                  </div>
                  <div>
                    <p>Current Status</p>
                    <span className="status-pill">
                      {timeline[currentStepIndex]?.label || order.order_status}
                    </span>
                  </div>
                </div>

                <div className="tracking-timeline">
                  {timeline.map((step) => (
                    <div
                      key={step.key}
                      className={`tracking-step tracking-${step.state} ${step.isCurrent ? "tracking-current" : ""
                        }`}
                    >
                      <div className="step-marker">
                        {step.state === "completed" ? (
                          <span className="marker-check" aria-hidden="true" />
                        ) : (
                          <span className="marker-dot" aria-hidden="true" />
                        )}
                      </div>
                      <div className="step-body">
                        <p className="step-title">{step.label}</p>
                        <p className="step-text">{step.info}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="tracking-summary">
                  <div>
                    <p>Shipping To</p>
                    <h5>
                      {order?.shipping_first_name} {order?.shipping_last_name}
                    </h5>
                    <p className="summary-text">
                      {[order?.shipping_address1, order?.shipping_address2,
                      order?.shipping_city, order?.shipping_state,
                      order?.shipping_pincode]
                        .filter(Boolean)
                        .join(", ") || "Address not available"}
                    </p>
                    <p className="summary-text">{order?.shipping_mobile}</p>
                  </div>
                  <div>
                    <p>Payment</p>
                    <h5>{order?.payment_method === "COD" ? "Cash On Delivery" : "Prepaid"}</h5>
                    <p className="summary-text">Total Paid</p>
                    <h4 className="summary-amount">₹{order?.grand_total_amount || order?.total_amount || 0}</h4>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default OrderTracking;
