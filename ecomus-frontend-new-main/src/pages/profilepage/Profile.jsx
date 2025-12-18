import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer";
import "../../css/profile.css";
import { useLocation, useNavigate } from "react-router-dom";
import { removeToken } from "../../Localstorage/Store";
import { useGetUserInfoQuery, usePatchUserMutation } from "../../store/api/userapi";
import { useGetOrderByUserQuery } from "../../store/api/orderapi";
import {
  useDeleteAddressMutation,
  useGetUserAddressQuery,
  usePatchaddressMutation,
  usePostCreateAddressMutation,
} from "../../store/api/addressapi";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { address as addressSchema } from "../../Validation/address";
import {
  FiCalendar,
  FiEdit3,
  FiMapPin,
  FiMail,
  FiPhone,
  FiPlus,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { FaUser } from "react-icons/fa";

const profileSchema = Yup.object({
  first_name: Yup.string().trim().required("First name is required"),
  last_name: Yup.string().trim().required("Last name is required"),
  email: Yup.string().trim().email("Enter a valid email").required("Email is required"),
  mobile: Yup.string()
    .trim()
    .matches(/^[0-9]{10}$/, "Enter a valid 10 digit mobile number")
    .required("Mobile number is required"),
  dob: Yup.string().nullable(),
});

const ProfileModal = ({ title, onClose, children, maxWidth = "560px" }) => {
  return (
    <div
      className="profile-modal__backdrop"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="profile-modal" style={{ maxWidth }} onClick={(event) => event.stopPropagation()}>
        <div className="profile-modal__header">
          <h3>{title}</h3>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close">
            <FiX />
          </button>
        </div>
        <div className="profile-modal__body">{children}</div>
      </div>
    </div>
  );
};

export const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    data: userinfo,
    isLoading: userloading,
    refetch: refetchuserinfo,
  } = useGetUserInfoQuery();
  const userId = userinfo?.data?._id;
  const { data: orderlist, isLoading: orderloading } = useGetOrderByUserQuery(userId, { skip: !userId });
  const {
    data: addressdata,
    isLoading: addressloading,
    refetch: refetchaddress,
  } = useGetUserAddressQuery(userId, { skip: !userId });

  const [patchuser, { isLoading: savingProfile }] = usePatchUserMutation();
  const [createAddress, { isLoading: creatingAddress }] = usePostCreateAddressMutation();
  const [updateAddress, { isLoading: updatingAddress }] = usePatchaddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();

  const [activeModal, setActiveModal] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const personalRef = useRef(null);
  const addressRef = useRef(null);
  const orderRef = useRef(null);

  const user = userinfo?.data;
  const addresses = addressdata?.data || [];
  const orders = orderlist?.orderlist || [];
  
  const initials = useMemo(() => {
    if (!user) return "";
    const first = user.first_name?.charAt(0) || user.email?.charAt(0) || "";
    const last = user.last_name?.charAt(0) || "";
    return `${first}${last}`.toUpperCase();
  }, [user]);

  const orderCount = orders.length;

  const showFeedback = (message, type = "success") => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const logout = () => {
    removeToken();
    navigate("/");
  };

  const scrollToSection = (target) => {
    const ref = target === "profile" ? personalRef : target === "addresses" ? addressRef : orderRef;
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    const id = location?.state?.id;
    if (!id) return;
    if (id === 1) scrollToSection("profile");
    else if (id === 2) scrollToSection("orders");
    else if (id === 3) scrollToSection("addresses");
  }, [location?.state?.id, addresses.length, orders.length]);

  const handleDeleteAddress = async (addressId) => {
    const confirmation = window.confirm("Delete this address?");
    if (!confirmation) return;
    const res = await deleteAddress(addressId);
    if (res?.data) {
      refetchaddress();
      showFeedback("Address removed successfully");
    }
  };

  const renderAddressCard = (item) => (
    <div key={item._id} className="address-card">
      <div className="address-card__header">
        <div>
          <h4>{`${item.first_name} ${item.last_name}`.trim()}</h4>
          <span>{item.tag}</span>
        </div>
        <div className="address-card__actions">
          <button
            type="button"
            className="icon-button"
            onClick={() => {
              setSelectedAddress(item);
              setActiveModal("editAddress");
            }}
            aria-label="Edit address"
          >
            <FiEdit3 />
          </button>
          <button
            type="button"
            className="icon-button icon-button--danger"
            onClick={() => handleDeleteAddress(item._id)}
            aria-label="Delete address"
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
      <ul className="address-card__body">
        <li>
          <FiPhone />
          <span>{item.mobile}</span>
        </li>
        <li>
          <FiMail />
          <span>{item.email}</span>
        </li>
        <li>
          <FiMapPin />
          <span>
            {[item.address1, item.address2, item.city, item.state, item.pincode]
              .filter(Boolean)
              .join(", ")}
          </span>
        </li>
      </ul>
    </div>
  );

  const renderOrderRow = (order) => {
    const status = order.order_status?.toLowerCase() || "pending";
    const dateString = order.order_date
      ? new Date(order.order_date.split("Time")[0]).toLocaleDateString("en-GB")
      : "--";
    return (
      <div key={order._id} className="order-row">
        <div className="order-row__header">
          <span className="order-id">#{order.orderid}</span>
          <span className={`order-status order-status--${status}`}>{order.order_status}</span>
        </div>
        <div className="order-row__meta">
          <span>{dateString}</span>
          <span>{order.totalItems} items</span>
        </div>
        <div className="order-row__footer">
          <span className="order-amount">INR {order.grand_total_amount}</span>
          <button
            type="button"
            className="text-link"
            onClick={() => navigate(`/order-history-detail/${order._id}`, { state: { orderId: order._id } })}
          >
            View details
          </button>
        </div>
      </div>
    );
  };

  if (userloading || orderloading || addressloading) {
    return (
      <div className="profile-page marginfromtop">
        <Header />
        <div className="profile-loading">Loading profile...</div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="profile-page marginfromtop">
        <section className="profile-hero">
          <div className="profile-hero__content">
            <div className="profile-hero__identity">
              <div className="profile-avatar">{initials || <FaUser />}</div>
              <div>
                <h1>{user?.first_name ? `${user.first_name} ${user.last_name}` : user?.email}</h1>
                <p className="profile-email">{user?.email}</p>
              </div>
            </div>
            <div className="profile-hero__actions">
              <button type="button" className="outline-button" onClick={() => setActiveModal("editProfile")}>
                <FiEdit3 /> Edit profile
              </button>
              <button type="button" className="primary-button" onClick={logout}>
                Logout
              </button>
            </div>
          </div>
        </section>

        {feedback ? (
          <div className={`profile-feedback profile-feedback--${feedback.type}`}>{feedback.message}</div>
        ) : null}

        <section className="profile-grid">
          <article className="profile-card" ref={personalRef} id="profile-info">
            <div className="profile-card__header">
              <h2>Personal information</h2>
              <button type="button" className="text-link" onClick={() => setActiveModal("editProfile")}>
                Edit
              </button>
            </div>
            <ul className="info-list">
              <li>
                <FaUser />
                <div>
                  <span className="info-label">Full name</span>
                  <span className="info-value">
                    {user?.first_name ? `${user.first_name} ${user.last_name}` : "--"}
                  </span>
                </div>
              </li>
              <li>
                <FiMail />
                <div>
                  <span className="info-label">Email</span>
                  <span className="info-value">{user?.email || "--"}</span>
                </div>
              </li>
              <li>
                <FiPhone />
                <div>
                  <span className="info-label">Mobile</span>
                  <span className="info-value">{user?.mobile || "--"}</span>
                </div>
              </li>
              <li>
                <FiCalendar />
                <div>
                  <span className="info-label">Date of birth</span>
                  <span className="info-value">
                    {user?.dob ? new Date(user.dob).toLocaleDateString("en-GB") : "--"}
                  </span>
                </div>
              </li>
            </ul>
          </article>

          <article className="profile-card profile-card--stack" ref={addressRef} id="address-book">
            <div className="profile-card__header">
              <h2>Address book</h2>
              <button
                type="button"
                className="primary-button primary-button--ghost"
                onClick={() => {
                  setSelectedAddress(null);
                  setActiveModal("addAddress");
                }}
              >
                <FiPlus /> Add address
              </button>
            </div>
            {addresses.length === 0 ? (
              <div className="empty-state">
                <p>No addresses saved yet.</p>
                <button
                  type="button"
                  className="text-link"
                  onClick={() => {
                    setSelectedAddress(null);
                    setActiveModal("addAddress");
                  }}
                >
                  Add your first address
                </button>
              </div>
            ) : (
              <div className="address-list">{addresses.map((item) => renderAddressCard(item))}</div>
            )}
          </article>

          <article className="profile-card profile-card--orders" ref={orderRef} id="order-history">
            <div className="profile-card__header">
              <h2>
                Recent orders <span className="profile-card__count">({orderCount})</span>
              </h2>
            </div>
            {orders.length === 0 ? (
              <div className="empty-state">
                <p>No purchases yet. Your future orders will appear here.</p>
                <button type="button" className="primary-button" onClick={() => navigate("/")}>
                  Start shopping
                </button>
              </div>
            ) : (
              <div className="order-list">{orders.map((order) => renderOrderRow(order))}</div>
            )}
          </article>
        </section>

        {activeModal === "editProfile" && (
          <ProfileModal
            title="Edit profile"
            onClose={() => {
              setActiveModal(null);
            }}
          >
            <Formik
              enableReinitialize
              initialValues={{
                first_name: user?.first_name || "",
                last_name: user?.last_name || "",
                email: user?.email || "",
                mobile: user?.mobile || "",
                dob: user?.dob ? new Date(user.dob).toISOString().split("T")[0] : "",
              }}
              validationSchema={profileSchema}
              onSubmit={async (values, { setSubmitting, setStatus }) => {
                try {
                  setStatus(undefined);
                  const payload = {
                    first_name: values.first_name.trim(),
                    last_name: values.last_name.trim(),
                    email: values.email.trim(),
                    mobile: values.mobile.trim(),
                    dob: values.dob || null,
                  };
                  const res = await patchuser(payload);
                  if (res?.error) {
                    throw res.error;
                  }
                  await refetchuserinfo();
                  setActiveModal(null);
                  showFeedback("Profile updated successfully");
                } catch (error) {
                  const message = error?.data?.message || "Unable to update profile";
                  setStatus(message);
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ errors, touched, isSubmitting, status }) => (
                <Form className="profile-form">
                  <div className="form-grid">
                    <label className="form-control">
                      <span>First name</span>
                      <Field type="text" name="first_name" placeholder="First name" />
                      {errors.first_name && touched.first_name ? (
                        <span className="form-error">{errors.first_name}</span>
                      ) : null}
                    </label>
                    <label className="form-control">
                      <span>Last name</span>
                      <Field type="text" name="last_name" placeholder="Last name" />
                      {errors.last_name && touched.last_name ? (
                        <span className="form-error">{errors.last_name}</span>
                      ) : null}
                    </label>
                    <label className="form-control">
                      <span>Email</span>
                      <Field type="email" name="email" placeholder="Email" />
                      {errors.email && touched.email ? (
                        <span className="form-error">{errors.email}</span>
                      ) : null}
                    </label>
                    <label className="form-control">
                      <span>Mobile number</span>
                      <Field type="tel" name="mobile" placeholder="10 digit mobile" />
                      {errors.mobile && touched.mobile ? (
                        <span className="form-error">{errors.mobile}</span>
                      ) : null}
                    </label>
                    <label className="form-control">
                      <span>Date of birth</span>
                      <Field type="date" name="dob" />
                      {errors.dob && touched.dob ? <span className="form-error">{errors.dob}</span> : null}
                    </label>
                  </div>
                  {status ? <div className="form-status">{status}</div> : null}
                  <div className="modal-actions">
                    <button type="button" className="outline-button" onClick={() => setActiveModal(null)}>
                      Cancel
                    </button>
                    <button type="submit" className="primary-button" disabled={isSubmitting || savingProfile}>
                      {isSubmitting || savingProfile ? "Saving..." : "Save changes"}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </ProfileModal>
        )}

        {(activeModal === "addAddress" || activeModal === "editAddress") && (
          <ProfileModal
            title={activeModal === "addAddress" ? "Add address" : "Edit address"}
            onClose={() => {
              setActiveModal(null);
              setSelectedAddress(null);
            }}
          >
            <Formik
              enableReinitialize
              initialValues={{
                first_name: selectedAddress?.first_name || "",
                last_name: selectedAddress?.last_name || "",
                email: selectedAddress?.email || "",
                mobile: selectedAddress?.mobile || "",
                address1: selectedAddress?.address1 || "",
                address2: selectedAddress?.address2 || "",
                country: selectedAddress?.country || "",
                state: selectedAddress?.state || "",
                city: selectedAddress?.city || "",
                pincode: selectedAddress?.pincode || "",
              }}
              validationSchema={addressSchema}
              onSubmit={async (values, { setSubmitting, setStatus, resetForm }) => {
                try {
                  setStatus(undefined);
                  const payload = {
                    ...values,
                    mobile: values.mobile,
                  };
                  let res;
                  if (activeModal === "addAddress") {
                    res = await createAddress(payload);
                  } else if (selectedAddress?._id) {
                    res = await updateAddress({ id: selectedAddress._id, data: payload });
                  }
                  if (res?.error) {
                    throw res.error;
                  }
                  await refetchaddress();
                  resetForm();
                  setActiveModal(null);
                  setSelectedAddress(null);
                  showFeedback(
                    activeModal === "addAddress"
                      ? "Address added successfully"
                      : "Address updated successfully"
                  );
                } catch (error) {
                  const message = error?.data?.message || "Unable to save address";
                  setStatus(message);
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ errors, touched, isSubmitting, status }) => (
                <Form className="profile-form">
                  <div className="form-grid form-grid--two">
                    <label className="form-control">
                      <span>First name</span>
                      <Field type="text" name="first_name" placeholder="First name" />
                      {errors.first_name && touched.first_name ? (
                        <span className="form-error">{errors.first_name}</span>
                      ) : null}
                    </label>
                    <label className="form-control">
                      <span>Last name</span>
                      <Field type="text" name="last_name" placeholder="Last name" />
                      {errors.last_name && touched.last_name ? (
                        <span className="form-error">{errors.last_name}</span>
                      ) : null}
                    </label>
                    <label className="form-control">
                      <span>Email</span>
                      <Field type="email" name="email" placeholder="Email" />
                      {errors.email && touched.email ? (
                        <span className="form-error">{errors.email}</span>
                      ) : null}
                    </label>
                    <label className="form-control">
                      <span>Mobile number</span>
                      <Field type="tel" name="mobile" placeholder="10 digit mobile" />
                      {errors.mobile && touched.mobile ? (
                        <span className="form-error">{errors.mobile}</span>
                      ) : null}
                    </label>
                    <label className="form-control">
                      <span>Address line 1</span>
                      <Field type="text" name="address1" placeholder="House / Building" />
                      {errors.address1 && touched.address1 ? (
                        <span className="form-error">{errors.address1}</span>
                      ) : null}
                    </label>
                    <label className="form-control">
                      <span>Address line 2</span>
                      <Field type="text" name="address2" placeholder="Street / Area" />
                      {errors.address2 && touched.address2 ? (
                        <span className="form-error">{errors.address2}</span>
                      ) : null}
                    </label>
                    <label className="form-control">
                      <span>Country</span>
                      <Field type="text" name="country" placeholder="Country" />
                      {errors.country && touched.country ? (
                        <span className="form-error">{errors.country}</span>
                      ) : null}
                    </label>
                    <label className="form-control">
                      <span>State</span>
                      <Field type="text" name="state" placeholder="State" />
                      {errors.state && touched.state ? (
                        <span className="form-error">{errors.state}</span>
                      ) : null}
                    </label>
                    <label className="form-control">
                      <span>City</span>
                      <Field type="text" name="city" placeholder="City" />
                      {errors.city && touched.city ? (
                        <span className="form-error">{errors.city}</span>
                      ) : null}
                    </label>
                    <label className="form-control">
                      <span>Pincode</span>
                      <Field type="text" name="pincode" placeholder="Postal code" />
                      {errors.pincode && touched.pincode ? (
                        <span className="form-error">{errors.pincode}</span>
                      ) : null}
                    </label>
                  </div>
                  {status ? <div className="form-status">{status}</div> : null}
                  <div className="modal-actions">
                    <button
                      type="button"
                      className="outline-button"
                      onClick={() => {
                        setActiveModal(null);
                        setSelectedAddress(null);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="primary-button"
                      disabled={isSubmitting || creatingAddress || updatingAddress}
                    >
                      {isSubmitting || creatingAddress || updatingAddress ? "Saving..." : "Save address"}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </ProfileModal>
        )}
      </main>
      <Footer />
    </>
  );
};

export default Profile;
