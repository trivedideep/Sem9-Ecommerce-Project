import React, { useContext, useEffect, useMemo, useState, useCallback } from "react";
import Header from "../components/Header/Header";
import OwlCarousel from "react-owl-carousel";
import ReactImageMagnify from "react-image-magnify";
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";
import Footer from "../components/Footer";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FaRegHeart, FaHeart } from "react-icons/fa6";
import { FaStar, FaRegStar } from "react-icons/fa";
import { getrecetly, gettoken, recentlystore } from "../Localstorage/Store";
import { useGetProductByCategoryQuery, useGetSingleProductQuery } from "../store/api/productapi";
import { usePostCartItemMutation } from "../store/api/cartapi";
import { useGetWishlistCountQuery, usePostDeleteWishlistMutation, usePostWishlistItemMutation } from "../store/api/wishlistapi";
import { useGetRecommendationsQuery } from "../store/api/orderapi";
import RatingStars from "../components/RatingStars";
import { useDispatch, useSelector } from "react-redux";
import { addwishlist } from "../store/state/wishlist";
import { skipToken } from "@reduxjs/toolkit/query";

const normalizeCategoryIdentifier = value => {
  if (value === undefined || value === null) {
    return null;
  }

  const asString = String(value).trim();
  return asString.length ? asString : null;
};

const appendCategoryIdsToSet = (source, targetSet) => {
  if (!source) {
    return;
  }

  if (Array.isArray(source)) {
    source.forEach(entry => appendCategoryIdsToSet(entry, targetSet));
    return;
  }

  if (typeof source === "string") {
    source
      .split(",")
      .map(chunk => normalizeCategoryIdentifier(chunk))
      .forEach(identifier => {
        if (identifier) {
          targetSet.add(identifier);
        }
      });
    return;
  }

  if (typeof source === "object") {
    const identifier = normalizeCategoryIdentifier(source?._id || source?.id);
    if (identifier) {
      targetSet.add(identifier);
    }
    return;
  }

  const identifier = normalizeCategoryIdentifier(source);
  if (identifier) {
    targetSet.add(identifier);
  }
};

const ensureTrailingSlash = (value = "") => (value.endsWith("/") ? value : `${value}/`);
const API_BASE_URL = ensureTrailingSlash(process.env.REACT_APP_API_URL || "http://localhost:8000/api/");

const options5 = {
  items: 1,
  loop: false,
  autoplay: true,
  nav: true,
  responsiveClass: true,
  dots: false,
  responsive: {
    1200: {
      items: 5,
      loop: false,
      // stagePadding: 50,
    },
    920: {
      items: 4,
      loop: false,
    },
    700: {
      items: 3,
      loop: false,
    },
    600: {
      items: 3,
      loop: false,
    },
    504: {
      items: 2,
      loop: false,
    },
    300: {
      items: 2,
      loop: false,
    },
    310: {
      items: 1,
      loop: false,
    },
  },
};
function Productdetails() {
  const location = useLocation();
  const nvg = useNavigate();
  const { id } = useParams();
  const recentlydata = getrecetly();
  const dispatch = useDispatch();
  const checktoken = gettoken()
  const storedToken = typeof window !== "undefined" ? localStorage.getItem("ecomustoken") : null;
  const normalizedToken = storedToken ? storedToken.replace(/"/g, "") : null;
  const globalvariable = useSelector(state => state);
  const [viewimg, setviewimg] = useState(null);
  const [qty, setqty] = useState(1);
  const [showoption, setshowoption] = useState(0);
  const [loading, setloading] = useState(true);
  const [delto, setdelto] = useState("");
  const [Data23, setData] = useState([]);
  const [delresponse, setdelresponse] = useState({ status: false, msg: "" });
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [canReview, setCanReview] = useState(false);
  const [ratingInput, setRatingInput] = useState(0);
  const [commentInput, setCommentInput] = useState("");
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewStatus, setReviewStatus] = useState("");
  const { data, isLoading, refetch } = useGetSingleProductQuery(id);
  const productCategoryIds = useMemo(() => {
    const collected = new Set();
    appendCategoryIdsToSet(data?.parentcategory, collected);
    appendCategoryIdsToSet(data?.childcategory, collected);
    appendCategoryIdsToSet(data?.data?.parent_category, collected);
    appendCategoryIdsToSet(data?.data?.child_category, collected);
    return Array.from(collected);
  }, [data]);
  const primaryCategoryId = useMemo(() => {
    if (data?.childcategory?.[0]?._id) {
      return data.childcategory[0]._id;
    }
    if (data?.parentcategory?.[0]?._id) {
      return data.parentcategory[0]._id;
    }

    const rawChild = Array.isArray(data?.data?.child_category)
      ? data.data.child_category[0]
      : null;
    if (rawChild) {
      return rawChild.split(",")[0];
    }

    const rawParent = Array.isArray(data?.data?.parent_category)
      ? data.data.parent_category[0]
      : null;
    if (rawParent) {
      return rawParent.split(",")[0];
    }

    if (productCategoryIds[0]) {
      return productCategoryIds[0];
    }

    return null;
  }, [data, productCategoryIds]);

  const categoryQueryArgs = primaryCategoryId
    ? { id: primaryCategoryId, url: "page=1" }
    : skipToken;

  const { data: relatedCategoryResponse, isFetching: relatedFetching } =
    useGetProductByCategoryQuery(categoryQueryArgs);

  const currentProductId = data?.data?._id || id;

  const {
    data: recommendationsData,
    isFetching: recommendationsFetching,
    isError: recommendationsErrorFlag,
    error: recommendationsError,
  } = useGetRecommendationsQuery(currentProductId ? currentProductId : skipToken);

  const recommendedProducts = useMemo(() => {
    const entries = recommendationsData?.recommendations || [];
    return entries
      .map(entry => entry?.product || null)
      .filter(Boolean);
  }, [recommendationsData]);

  const relatedProducts = useMemo(() => {
    const pool = relatedCategoryResponse?.data || [];
    if (!pool.length) {
      return [];
    }

    const uniquePool = [];
    const seenIds = new Set();
    const productCategorySet = new Set(productCategoryIds);

    pool.forEach(productItem => {
      const productId = productItem?._id;
      if (!productId || productId === currentProductId || seenIds.has(productId)) {
        return;
      }

      const itemCategoryIds = new Set();
      appendCategoryIdsToSet(productItem?.parent_category, itemCategoryIds);
      appendCategoryIdsToSet(productItem?.child_category, itemCategoryIds);

      let hasMatchingCategory = productCategorySet.size === 0;
      if (!hasMatchingCategory) {
        itemCategoryIds.forEach(categoryId => {
          if (!hasMatchingCategory && productCategorySet.has(categoryId)) {
            hasMatchingCategory = true;
          }
        });
      }

      if (!hasMatchingCategory) {
        return;
      }

      seenIds.add(productId);
      uniquePool.push(productItem);
    });

    if (!uniquePool.length) {
      return [];
    }

    const shuffled = [...uniquePool];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }

    return shuffled.slice(0, 4);
  }, [relatedCategoryResponse, currentProductId, productCategoryIds]);

  const isRelatedLoading = relatedFetching && relatedProducts.length === 0;
  const showRelatedSection = Boolean(primaryCategoryId) && (isRelatedLoading || relatedProducts.length > 0);
  const relatedPlaceholders = [0, 1, 2, 3];
  const showRecommendationsSection = recommendationsFetching || recommendedProducts.length > 0 || recommendationsErrorFlag;
  const recommendationPlaceholders = [0, 1, 2, 3];
  const fallbackRelatedImage = "/images/mega-store/product/1.jpg";
  const formatInr = value => {
    const numericPrice = Number(value);
    if (!Number.isFinite(numericPrice)) {
      return "₹0";
    }
    return `₹${numericPrice.toLocaleString("en-IN")}`;
  };
  const [addincart] = usePostCartItemMutation();
  const [addtowishlistapi] = usePostWishlistItemMutation();
  const [removetowishlistapi] = usePostDeleteWishlistMutation();
  const { data: wishlistcount, isLoading: wislistloading, refetch: wishlistrefetch } = useGetWishlistCountQuery()
  const devto = () => {
    if (delto === "") {
      // console.log("dddd",delresponse)
      // setdelresponse["status"] = true;
      // setdelresponse["msg"] = "Deliver to field is required";
      setdelresponse({ status: true, msg: "Deliver to field is required" });
    } else {
      // setdelresponse["status"] = true;
      // setdelresponse["msg"] = "Something went wrong please try Again";
      setdelresponse({
        status: true,
        msg: "Something went wrong please try Again",
      });
    }
    setdelto("");
    setTimeout(() => {
      setdelresponse({ status: false, msg: "" });
    }, 4000);
  };
  const redirectfun = (linkpage) => {
    nvg(linkpage);
  };

  const profilepage = (val) => {
    nvg("/profile", { state: { id: val } });
  };

  const refreshReviews = useCallback(async () => {
    if (!currentProductId) return;
    setReviewsLoading(true);
    setReviewError("");
    try {
      const response = await axios.get(`${API_BASE_URL}review/product/${currentProductId}`, {
        headers: normalizedToken ? { Authorization: `Bearer ${normalizedToken}` } : {},
      });

      const payload = response.data?.data || {};
      setReviews(payload.reviews || []);
      setAverageRating(payload.averageRating || 0);
      setTotalReviews(payload.totalReviews || 0);
      setCanReview(payload.canReview || false);

      if (payload.userReview) {
        setRatingInput(payload.userReview.rating);
        setCommentInput(payload.userReview.comment || "");
      } else {
        setRatingInput(0);
        setCommentInput("");
      }
    } catch (error) {
      setReviewError("Unable to load reviews right now.");
    } finally {
      setReviewsLoading(false);
    }
  }, [currentProductId, normalizedToken]);

  useEffect(() => {
    refreshReviews();
  }, [refreshReviews]);

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    setReviewError("");
    setReviewStatus("");

    if (!normalizedToken) {
      nvg("/login");
      return;
    }

    if (!ratingInput) {
      setReviewError("Please select a rating to continue.");
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}review/add`,
        {
          productId: currentProductId,
          rating: ratingInput,
          comment: commentInput,
        },
        {
          headers: { Authorization: `Bearer ${normalizedToken}` },
        }
      );

      setReviewStatus("Thanks! Your review has been saved.");
      await refreshReviews();
    } catch (error) {
      const serverMessage = error?.response?.data?.error || "Unable to save review.";
      setReviewError(serverMessage);
    }
  };

  // Track increments/decrements
  const [incCount, setIncCount] = useState(0);
  const [decCount, setDecCount] = useState(0);
  // Helper to get current stock for selected option
  const getCurrentStock = () => {
    if (!Data23?.[showoption]) return 0;
    return Data23[showoption]?.stock || 0;
  };
  // Prevent qty from exceeding stock
  useEffect(() => {
    const stock = getCurrentStock();
    if (qty > stock) setqty(stock > 0 ? stock : 1);
  }, [showoption, Data23]);
  const incrementcart = () => {
    const stock = getCurrentStock();
    if (qty < stock) {
      setqty(qty + 1);
      setIncCount(incCount + 1);
    }
  };
  const decrementcart = () => {
    if (qty > 1) {
      setqty(qty - 1);
      setDecCount(decCount + 1);
    }
  };


  const Addtowishlist = async () => {
    if (checktoken) {
      const wishlist_value = {
        product_name: Data23[showoption].product_name,
        product_id: Data23[showoption].product_id ? null : Data23[showoption]._id,
        item_or_variant: Data23[showoption].product_id ? "variant" : "item",
        product_variant_id: Data23[showoption].product_id ? Data23[showoption]._id : null
      }

      const response = await addtowishlistapi(wishlist_value);
      if (response.data.status === "successfully") {
        wishlistrefetch()
        if (wislistloading === false) {
          // dispatch(addwishlist(globalvariable.wishlist + 1));
          dispatch(addwishlist(wishlistcount.totalItems));
          refetch()
        }
      }
    } else {
      nvg('/login')
    }
  };
  const Removetowishlist = async () => {
    const wishlist_value = {
      product_id: Data23[showoption].product_id ? null : Data23[showoption]._id,
      item_or_variant: Data23[showoption].product_id ? "variant" : "item",
      product_variant_id: Data23[showoption].product_id ? Data23[showoption]._id : null
    }

    const response = await removetowishlistapi(wishlist_value);
    if (response.data.status === "successfully") {
      // dispatch(addwishlist(globalvariable.wishlist - 1));
      wishlistrefetch()
      if (wislistloading === false) {
        dispatch(addwishlist(wishlistcount.totalItems));
        refetch()

      }
    }
  };

  // add to cart start here
  const addtocartfun = async () => {
    const availableStock = getCurrentStock();
    if (availableStock <= 0) {
      alert("This product is currently out of stock.");
      return;
    }
    try {
      const cart_value = {
        product_name: Data23[showoption].product_name,
        product_id: Data23[showoption].product_id ? null : Data23[showoption]._id,
        product_qty: qty,
        item_or_variant: Data23[showoption].product_id ? "variant" : "item",
        product_variant_id: Data23[showoption].product_id ? Data23[showoption]._id : null
      };
      const response = await addincart(cart_value);
      if (response.data && response.data.status === "successfully") {
        nvg("/cart");
      } else if (response.error && response.error.status === 401) {
        nvg('/login');
      } else {
        alert("Failed to add to cart.");
      }
    } catch (error) {
      alert("Error adding to cart.");
    }
  };
  const addRecommendedToCart = async (productItem) => {
    if (!productItem?._id) return;
    try {
      const cart_value = {
        product_name: productItem.product_name,
        product_id: productItem._id,
        product_qty: 1,
        item_or_variant: "item",
        product_variant_id: null,
      };
      const response = await addincart(cart_value);
      if (response.data && response.data.status === "successfully") {
        nvg("/cart");
      } else if (response.error && response.error.status === 401) {
        nvg("/login");
      } else {
        alert("Failed to add to cart.");
      }
    } catch (error) {
      alert("Error adding to cart.");
    }
  };
  //  add to cart item end here

  const currentStock = getCurrentStock();
  const isOutOfStock = currentStock <= 0;

  let ispresent = false;
  useEffect(() => {
    const addProductToRecentlyViewed = (mydata, id) => {
      if (recentlydata == null) {
        recentlystore([id]);
      } else {
        if (recentlydata.some((obj) => obj === id)) {
          console.log(`Object with id ${mydata} is in the array!`);
          ispresent = true;
        } else {
        }
        if (ispresent === false) {
          console.log(`Object with id ${mydata} is not in the array.`, mydata);
          // if (recentlyViewed.length < 13) {
          //   console.log("first 13 leng")
          //   // If the array size is less than the maximum, simply add the new object
          //   setRecentlyViewed([...recentlyViewed, mydata]);
          // } else {
          // If the array size is equal to the maximum, replace the oldest element

          recentlystore([...recentlydata, id]);
          // }
        }
      }
    };
    setloading(true)
    if (isLoading === false && data?.data) {
      const newdata1 = [data.data, ...(data.productvariant || [])];

      const newdata = newdata1.map(item => ({
        ...item,
        weightandtype: `${item.weight} ${item.weight_type}`, // Replace 'defaultValue' with your desired value
      }));
      console.log("this is latest data", newdata)
      setData(newdata)
      setloading(false)
    }

  }, [data, isLoading]);

  const transfer = () => {
    nvg("/category", {
      state: {
        id: location.state?.categoryid,
        pagename: location.state?.pagename,
      },
    });
    window.location.reload();
  };

  const transfer3 = (productid) => {
    nvg("/productdetails", {
      state: {
        id: productid,
        categoryid: location.state?.categoryid,
        pagename: location.state?.pagename,
      },
    });
    window.location.reload();
  };
  return isLoading === true ? (
    ""
  ) : (
    <>
      <Header />

      {/* breadcrumb start */}
      <div className="breadcrumb-main marginfromtop">
        <div className="container m-0">
          <div className="row">
            <div className="col">
              <div
                className="breadcrumb-contain m-0"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingLeft: "5px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  {/* <h2>product</h2> */}
                  <ul>
                    <li>
                      <a href="/">home</a>
                    </li>
                    <li style={{ fontSize: "12px" }}>&gt;</li>
                    <li>
                      <p
                        onClick={() => {
                          transfer();
                        }}
                        style={{ cursor: "pointer", fontSize: "12px" }}
                      >
                        {data?.parentcategory?.[0]?.name}
                      </p>
                    </li>
                    <li style={{ fontSize: "12px" }}>&gt;</li>
                    <li>
                      <span
                        style={{
                          fontSize: "12px",
                          textTransform: "capitalize",
                          cursor: "default"
                        }}
                      >
                        {data?.childcategory?.[0]?.name}
                      </span>
                    </li>
                  </ul>
                </div>
                <div
                  className="header-contain"
                  style={{ padding: "8px 0px 0px 0px" }}
                >
                  <div
                    className="icon-block  twoicon"
                    style={{ width: "100%", display: "none" }}
                  >
                    <ul
                      className="theme-color"
                      style={{
                        width: "100%",
                        background: "",
                        justifyContent: "space-around",
                        paddingRight: "10px",
                      }}
                    >
                      <li
                        className=" icon-md-block"
                        onClick={() => redirectfun("/")}
                      >
                      </li>
                      <li></li>
                      <li
                        className="mobile-setting "
                        onClick={() => redirectfun("/order-history")}
                      ></li>
                      <li
                        className="mobile-wishlist item-count icon-desk-none"
                        onClick={() => redirectfun("/wishlist")}
                      >
                        <img
                          src="./images/mega-store/brand/heart.png"
                          className="newwidthpro hellopooja"
                          alt="heart"
                        />
                        <label
                          htmlFor=""
                          style={{ fontSize: "10px", margin: "0px" }}
                        >
                          Wishlist
                        </label>
                        <div
                          className="item-count-contain inverce"
                          style={{ top: "-4px", left: "9px" }}
                        >
                          {" "}
                          1{" "}
                        </div>
                      </li>
                      <li
                        className="mobile-cart
                      item-count"
                        onClick={() => {
                          redirectfun("/cart");
                        }}
                      >
                        <img
                          src="./images/mega-store/brand/shopping-cart.png"
                          className="newwidthpro  hellopooja"
                          alt="cart"
                        />
                        <label
                          htmlFor=""
                          style={{ fontSize: "10px", margin: "0px" }}
                        >
                          Cart
                        </label>

                        <div
                          className="item-count-contain inverce"
                          style={{ top: "-4px", left: "9px" }}
                        >
                          {" "}
                          {2}{" "}
                        </div>
                        {/* <div className="item-count-contain inverce" style={{top:'-4px',left:'9px'}}> {Cartnumber} </div> */}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* breadcrumb End */}
      {/* section start */}
      <section>
        <div className="collection-wrapper">
          <div className="custom-container">
            <div className="row">
              <div className="col-lg-12 col-sm-12 col-xs-12">
                <div className="container-fluid">
                  {/* <div className="row">
                      <div className="col-xl-12">
                      </div>
                    </div> */}
                  <div
                    className="row"
                    style={{ display: "flex", alignItems: "flex-start" }}
                  >
                    <div className="col-lg-6 makestk">
                      <div className="row">
                        <div className="col-md-3 col-3 superpadding3">
                          <div
                            class="container-fluid px-lg-4 px-md-3 px-2"
                            style={{ paddingLeft: "0px", paddingRight: "0px" }}
                          >
                            <div
                              style={{ padding: "0px 0px 5px 0px" }}
                              className="shirt"
                            >
                              <img
                                src={`${process.env.REACT_APP_API_IMAGE_URL}${Data23?.[showoption]?.product_image1}`}
                                onClick={() => {
                                  setviewimg(
                                    `${process.env.REACT_APP_API_IMAGE_URL}${Data23?.[showoption]?.product_image1}`
                                  );
                                }}
                                alt={Data23?.[showoption]?.product_name || 'Product'}
                                style={{ aspectRatio: "1/1" }}
                                className="img-fluid  image_zoom_cls-0"
                              />
                            </div>
                            {Data23?.[showoption]?.product_image2 ? (
                              <div
                                style={{ padding: "5px 0px" }}
                                className="shirt2"
                              >
                                <img
                                  src={`${process.env.REACT_APP_API_IMAGE_URL}${Data23?.[showoption]?.product_image2}`}
                                  onClick={() => {
                                    setviewimg(
                                      `${process.env.REACT_APP_API_IMAGE_URL}${Data23?.[showoption]?.product_image2}`
                                    );
                                  }}
                                  alt={Data23?.[showoption]?.product_name || ''}
                                  style={{ aspectRatio: "1/1" }}
                                  className="img-fluid  image_zoom_cls-1"
                                />
                              </div>
                            ) : (
                              ""
                            )}
                            {Data23?.[showoption]?.product_image3 ? (
                              <div
                                style={{ padding: "5px 0px" }}
                                className="shirt3"
                              >
                                <img
                                  src={`${process.env.REACT_APP_API_IMAGE_URL}${Data23?.[showoption]?.product_image3}`}
                                  onClick={() => {
                                    setviewimg(
                                      `${process.env.REACT_APP_API_IMAGE_URL}${Data23?.[showoption]?.product_image3}`
                                    );
                                  }}
                                  alt={Data23?.[showoption]?.product_name || ''}
                                  style={{ aspectRatio: "1/1" }}
                                  className="img-fluid  image_zoom_cls-2"
                                />
                              </div>
                            ) : (
                              ""
                            )}
                            {Data23?.[showoption]?.product_image4 ? (
                              <div
                                style={{ padding: "5px 0px" }}
                                className="shirt4"
                              >
                                <img
                                  src={`${process.env.REACT_APP_API_IMAGE_URL}${Data23?.[showoption]?.product_image4}`}
                                  onClick={() => {
                                    setviewimg(
                                      `${process.env.REACT_APP_API_IMAGE_URL}${Data23?.[showoption]?.product_image4}`
                                    );
                                  }}
                                  alt={Data23?.[showoption]?.product_name || ''}
                                  style={{ aspectRatio: "1/1" }}
                                  className="img-fluid  image_zoom_cls-3"
                                />
                              </div>
                            ) : (
                              ""
                            )}
                          </div>
                        </div>
                        <div className="col-md-9 col-9">
                          <div className="product-slick ">
                            <div>
                              <ReactImageMagnify
                                {...{
                                  smallImage: {
                                    alt: "Wristwatch by Versace",
                                    isFluidWidth: true,
                                    src:
                                      viewimg == null
                                        ? `${process.env.REACT_APP_API_IMAGE_URL}${Data23?.[showoption]?.product_image1}`
                                        : viewimg,
                                    width: 140,
                                    height: 600,
                                  },
                                  largeImage: {
                                    src:
                                      viewimg == null
                                        ? `${process.env.REACT_APP_API_IMAGE_URL}${Data23?.[showoption]?.product_image1}`
                                        : viewimg,
                                    width: 836,
                                    height: 1100,
                                  },
                                  enlargedImagePosition: "over",
                                  lensStyle: {
                                    backgroundColor: "rgba(0,0,0,.6)",
                                  },
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-6 rtl-text p-0">
                      <div
                        className="product-right "
                        style={{
                          boxShadow: "0px 14px 40px 0px rgba(0, 0, 0, 0.12)",
                          borderRadius: "10px",
                          padding: "20px 17px",
                        }}
                      >
                        <div className="pro-group">
                          <h2>{Data23?.[showoption]?.product_name}</h2>
                          <div style={{ marginTop: "6px" }}>
                            <RatingStars
                              rating={averageRating}
                              reviewCount={totalReviews}
                              showCount
                              size={16}
                            />
                          </div>
                          <div className="revieu-box">
                            <ul className="pro-price">
                              <li
                                style={{
                                  color: "#059fe2",
                                  fontWeight: "700",
                                  fontSize: "18px",
                                }}
                              >
                                {/* ₹{Data23?.[showoption]?.selling_price} */}
                                ₹{Data23?.[showoption]?.selling_price}{" "}
                                {Data23?.[showoption]?.stock_record?.discount ===
                                  0 ? (
                                  ""
                                ) : (
                                  <span
                                    style={{
                                      fontSize: "13px",
                                      margin: '0px',
                                      color: "#c1c1c1",
                                      lineHeight: "20px",
                                      textDecoration:
                                        "line-through",
                                      paddingLeft: "0px",
                                      fontWeight: "400",
                                    }}
                                  >
                                    ₹{Data23?.[showoption]?.mrp_price}
                                  </span>
                                )}
                                {Data23?.[showoption]?.stock_record?.discount ===
                                  0 ? (
                                  ""
                                ) : (
                                  <span
                                    style={{
                                      fontSize: "13px",
                                      color: "#059fe2",
                                      margin: '0px',
                                      lineHeight: "20px",
                                      paddingLeft: "1px",
                                      textDecoration: 'none',
                                      fontWeight: "400",
                                    }}
                                  >
                                    {`(${parseInt(
                                      ((Data23?.[showoption]?.mrp_price -
                                        Data23?.[showoption]?.selling_price) /
                                        Data23?.[showoption]?.mrp_price) *
                                      100
                                    )}%off)`}
                                  </span>
                                )}
                              </li>

                              <li style={{ color: "black", fontSize: "11px" }} onClick={() => { Data23?.[showoption]?.wishlist_status === true ? Removetowishlist() : Addtowishlist() }}> {Data23?.[showoption]?.wishlist_status === true ? <FaHeart size={19} color="#059fe2" /> : <FaRegHeart size={19} />}</li>


                            </ul>
                          </div>
                        </div>
                        <div
                          id="selectSize"
                          className="pro-group addeffect-section product-description border-product d-flex"
                          style={{
                            flexWrap: "wrap",
                            justifyContent: "space-between",
                          }}
                        >


                          {Data23.map((item, index) => (
                            <div className="productdetailcontainer customwidth" style={{ display: index === 0 && item.brand !== "" && item.brand !== undefined && item.brand !== undefined ? "block" : "none" }}>
                              <h6 className="product-title mt-2" style={{ display: index === 0 && item.brand !== "" && item.brand !== undefined && item.brand !== undefined ? "block" : "none" }}>
                                Brand
                              </h6>

                              <div className="size-box">
                                <ul>
                                  {Data23.map((item, index) => (
                                    <li style={{ height: 'auto', width: 'fit-content', padding: "3px 4px", background: "#059fe2", display: index === 0 && item.brand !== "" && item.brand !== undefined ? 'inline-block' : 'none' }}>
                                      <button type="button" style={{ color: "#fff", background: "transparent", border: "none", padding: 0, cursor: "pointer" }}>
                                        {item.brand}
                                      </button>
                                    </li>

                                  ))}
                                  {/* <li style={{ background: "#059fe2" }}><a style={{ color: "white" }} href="javascript:void(0)">l</a></li> */}
                                </ul>
                              </div>
                            </div>
                          ))}

                          {Data23.map((item, index) => (
                            <div className="productdetailcontainer customwidth" style={{ display: index === 0 && item.color !== "" && item.color !== undefined && item.color !== undefined ? "block" : "none" }}>
                              <h6 className="product-title">color</h6>
                              <div className="color-selector inline">
                                <ul>
                                  {Data23.map((item, index) => (
                                    <li >
                                      <div className="color-4" style={{ display: 'block', background: `${item.color}`, padding: showoption === index ? `19px 19px` : `15px 15px` }} onClick={() => { setshowoption(index) }} ></div>
                                    </li>
                                  ))}



                                  {/* 
{Data23.map((item, index) => {
        // Check if the color has been encountered before
        const isDuplicate = Data23.findIndex((colorItem, i) => i < index && colorItem.color === item.color) !== -1;

        // If not a duplicate, render the color
        if (!isDuplicate) {
          return (
            <li key={index}>
              <div className="color-4" style={{ display: 'block', background: `${item.color}` }}></div>
            </li>
          );
        }

        // If duplicate, don't render anything
        return null;
      })} */}

                                </ul>
                              </div>
                            </div>
                          ))}

                          {Data23.map((item, index) => (
                            <div className="productdetailcontainer customwidth" style={{ display: index === 0 && item.size !== "" && item.size !== undefined && item.size !== undefined && item.size !== 0 ? "block" : "none" }}>
                              <h6 className="product-title mt-2">
                                Available Size
                              </h6>
                              <div className="size-box">
                                <ul>
                                  {Data23.map((item, index) => (
                                    <li style={{ background: showoption === index ? "#059fe2" : "#fff" }} >
                                      <button type="button" style={{ color: showoption === index ? "white" : "#333", background: "transparent", border: "none", padding: 0, cursor: "pointer" }} onClick={() => { setshowoption(index) }}>
                                        {item.size}
                                      </button>
                                    </li>

                                  ))}
                                  {/* <li style={{ background: "#059fe2" }}><a style={{ color: "white" }} href="javascript:void(0)">l</a></li> */}
                                </ul>
                              </div>
                            </div>
                          ))}

                          {Data23.map((item, index) => (
                            <div className="productdetailcontainer customwidth" style={{ display: index === 0 && item.weight !== "" && item.weight !== undefined && item.weight !== undefined && item.weight !== 0 ? "block" : "none" }}>
                              <h6 className="product-title mt-2">
                                Available Weight
                              </h6>
                              <div className="size-box">
                                <ul>
                                  {Data23.map((item, index) => (
                                    <li style={{ background: showoption === index ? "#059fe2" : "#fff", width: 'fit-content', display: 'inline-block ', padding: '0px 3px' }} >
                                      <button type="button" style={{ color: showoption === index ? "white" : "#333", background: "transparent", border: "none", padding: 0, cursor: "pointer" }} onClick={() => { setshowoption(index) }}>
                                        {item.weightandtype}
                                      </button>
                                    </li>

                                  ))}
                                  {/* <li style={{ background: "#059fe2" }}><a style={{ color: "white" }} href="javascript:void(0)">l</a></li> */}
                                </ul>
                              </div>
                            </div>
                          ))}

                          <div className="productdetailcontainer customwidth">
                            <h6 className="product-title mt-3">quantity</h6>
                            <div
                              className="qty-box gap"
                              style={{
                                width: "100%",
                                justifyContent: "start",
                                flexDirection: 'column',
                                alignItems: 'start',
                                gap: "20px"

                              }}
                            >
                              <div className="input-group" style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid #E0E0E0',
                                borderRadius: '6px',
                                background: '#fff',
                                width: '80px',
                                height: '34px',
                                overflow: 'hidden',
                              }}>
                                <button
                                  type="button"
                                  onClick={decrementcart}
                                  disabled={qty <= 1}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    width: '33%',
                                    color: '#03A9F4',
                                    fontSize: '22px',
                                    fontWeight: 600,
                                    cursor: qty > 1 ? 'pointer' : 'not-allowed',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  &#8211;
                                </button>
                                <span style={{
                                  width: '34%',
                                  fontWeight: 700,
                                  fontSize: '15px',
                                  color: '#222',
                                  minWidth: '24px',
                                  textAlign: 'center',
                                  display: 'inline-block',
                                  lineHeight: '29px',
                                }}>{qty}</span>
                                <button
                                  type="button"
                                  onClick={incrementcart}
                                  disabled={qty >= currentStock}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    width: '33%',
                                    color: '#03A9F4',
                                    fontSize: '22px',
                                    fontWeight: 600,
                                    cursor: qty < currentStock ? 'pointer' : 'not-allowed',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  +
                                </button>
                              </div>
                              <div style={{ marginTop: 4 }}>
                                <span style={{ fontSize: 13, color: currentStock === 0 ? 'red' : '#059fe2' }}>
                                  {currentStock === 0 ? 'Out of Stock' : `In Stock: ${currentStock}`}
                                </span>
                              </div>
                              {/* <span style={{display: 'flex',}}> */}
                              {/* <h6 className="product-title"></h6> */}
                              <div className="product-buttons">
                                <button
                                  onClick={() => { checktoken ? addtocartfun() : nvg('/login') }}
                                  type="button"
                                  style={{
                                    background: isOutOfStock ? "#cfd8dc" : "#059fe2",
                                    padding: "12px 9px",
                                    marginLeft: '0px',
                                    borderRadius: "6px",
                                    border: "none",
                                    color: isOutOfStock ? "#607d8b" : "white",
                                    fontWeight: "500",
                                    cursor: isOutOfStock ? "not-allowed" : "pointer",
                                  }}
                                  id="cartEffect"
                                  className="btn cart-btn btn-normal tooltip-top"
                                  data-tippy-content="Add to cart"
                                  disabled={isOutOfStock}
                                >
                                  <i className="fa fa-shopping-cart" />
                                  add to cart
                                </button>

                              </div>
                              {/* </span> */}
                            </div>
                          </div>

                          <div
                            className="productdetailcontainer w-lg-50 w-xs-100 d-flex"
                            style={{
                              flexDirection: "column",
                              alignItems: "end",
                              justifyContent: "center",
                              marginTop: "10px",
                            }}
                          >

                          </div>

                          <div className="productdetailcontainer w-100">
                            <h5 className="product-title ">Description</h5>
                            <p style={{ color: "#8F9091", fontSize: "12px" }}>
                              {Data23?.[showoption]?.sort_description}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div
                        className="product-right "
                        style={{
                          marginTop: "20px",
                          boxShadow: "0px 14px 40px 0px rgba(0, 0, 0, 0.12)",
                          borderRadius: "10px",
                          padding: "20px 17px",
                        }}
                      >
                        <div
                          id="selectSize"
                          className="pro-group addeffect-section product-description border-product d-flex"
                          style={{
                            flexWrap: "wrap",
                            justifyContent: "space-between",
                          }}
                        >
                          <div className="productdetailcontainer w-100">
                            <h5 className="product-title ">Product Details</h5>
                            <div
                              dangerouslySetInnerHTML={{
                                __html: Data23?.[showoption]?.description,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section
        className="section-big-pt-space b-g-light"
        style={{ background: "white", borderTop: "1px solid #f1f2f3" }}
      >
        <div className="custom-container">
          <div className="row">
            <div className="col-lg-7">
              <h3
                className="mb-3"
                style={{ fontSize: "20px", fontWeight: 700 }}
              >
                Ratings & Reviews
              </h3>
              <div className="d-flex align-items-center gap-3 mb-3">
                <RatingStars
                  rating={averageRating}
                  reviewCount={totalReviews}
                  showCount
                  size={16}
                />
                <span style={{ fontSize: "13px", color: "#8F9091" }}>
                  Based on {totalReviews || 0} {totalReviews === 1 ? "review" : "reviews"}
                </span>
              </div>
              {reviewsLoading ? (
                <p style={{ fontSize: "13px", color: "#8F9091" }}>Loading reviews...</p>
              ) : reviews.length ? (
                <div className="review-scroll">
                  {reviews.map(review => (
                    <div
                      key={review?._id}
                      className="border rounded p-3 mb-3"
                      style={{ background: "#fafafa" }}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span style={{ fontWeight: 600, fontSize: "13px" }}>
                          {review?.userId?.first_name || "Customer"} {review?.userId?.last_name || ""}
                        </span>
                        <RatingStars rating={review?.rating} size={12} />
                      </div>
                      {review?.comment && (
                        <p style={{ fontSize: "12px", marginBottom: "4px" }}>{review.comment}</p>
                      )}
                      <small style={{ fontSize: "11px", color: "#8F9091" }}>
                        {review?.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}
                      </small>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: "13px", color: "#8F9091" }}>
                  Be the first to review this product.
                </p>
              )}
            </div>
            <div className="col-lg-5 mt-4 mt-lg-0">
              <div className="border rounded p-4 h-100" style={{ background: "#fdfdfd" }}>
                <h5 style={{ fontSize: "16px", fontWeight: 600 }}>Share your feedback</h5>
                {!checktoken ? (
                  <p style={{ fontSize: "13px" }}>
                    <button
                      type="button"
                      className="btn btn-link p-0"
                      style={{ fontSize: "13px" }}
                      onClick={() => nvg("/login")}
                    >
                      Sign in
                    </button>{" "}
                    to write a review.
                  </p>
                ) : canReview ? (
                  <form onSubmit={handleReviewSubmit}>
                    <div className="mb-2">
                      <label className="form-label" style={{ fontSize: "12px", fontWeight: 600 }}>
                        Rating
                      </label>
                      <div className="d-flex" style={{ gap: "6px" }}>
                        {[1, 2, 3, 4, 5].map(value => (
                          <button
                            type="button"
                            key={`rating-${value}`}
                            className="btn p-0"
                            onClick={() => setRatingInput(value)}
                            aria-label={`Rate ${value} star`}
                          >
                            {value <= ratingInput ? (
                              <FaStar size={18} color="#f5a623" />
                            ) : (
                              <FaRegStar size={18} color="#c5c5c5" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-2">
                      <label className="form-label" style={{ fontSize: "12px", fontWeight: 600 }}>
                        Comment (optional)
                      </label>
                      <textarea
                        className="form-control"
                        rows={3}
                        style={{ fontSize: "12px" }}
                        placeholder="Tell us what you liked"
                        value={commentInput}
                        onChange={event => setCommentInput(event.target.value)}
                      />
                    </div>
                    {reviewError && (
                      <p style={{ color: "#d9534f", fontSize: "12px" }}>{reviewError}</p>
                    )}
                    {reviewStatus && (
                      <p style={{ color: "#28a745", fontSize: "12px" }}>{reviewStatus}</p>
                    )}
                    <button type="submit" className="btn btn-primary mt-3" style={{ fontSize: "12px" }}>
                      Submit Review
                    </button>
                  </form>
                ) : (
                  <p style={{ fontSize: "13px", color: "#8F9091" }}>
                    You can review this product after completing a purchase.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      {showRecommendationsSection && (
        <section
          className="section-big-py-space b-g-light"
          style={{ background: "white", borderTop: "1px solid #f1f2f3" }}
        >
          <div className="custom-container">
            <div className="row justify-content-between align-items-center mb-3">
              <div className="col-12 col-md-6">
                <h3
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    margin: 0,
                    textTransform: "capitalize",
                  }}
                >
                  Customers who bought this product also bought
                </h3>
              </div>
              {recommendationsFetching && (
                <div className="col-12 col-md-6 text-md-end mt-2 mt-md-0">
                  <span style={{ fontSize: "12px", color: "#8F9091" }}>
                    Finding products for you...
                  </span>
                </div>
              )}
            </div>
            <div
              className="d-flex flex-nowrap"
              style={{ gap: "16px", overflowX: "auto", paddingBottom: "6px" }}
            >
              {recommendationsFetching && recommendedProducts.length === 0
                ? recommendationPlaceholders.map(placeholderKey => (
                  <div
                    key={`rec-skeleton-${placeholderKey}`}
                    style={{
                      minWidth: 200,
                      height: 260,
                      borderRadius: "12px",
                      background: "#f4f6f8",
                      flex: "0 0 auto",
                    }}
                  />
                ))
                : recommendedProducts.length > 0
                  ? recommendedProducts.map(recProduct => {
                    const imageSrc = recProduct?.product_image1
                      ? `${process.env.REACT_APP_API_IMAGE_URL}${recProduct.product_image1}`
                      : fallbackRelatedImage;
                    const sellingPriceLabel = formatInr(recProduct?.selling_price);
                    const mrpPriceNumeric = Number(recProduct?.mrp_price);
                    const sellingPriceNumeric = Number(recProduct?.selling_price);
                    const showStrikePrice =
                      Number.isFinite(mrpPriceNumeric) &&
                      Number.isFinite(sellingPriceNumeric) &&
                      mrpPriceNumeric > sellingPriceNumeric;

                    return (
                      <div
                        key={recProduct?._id}
                        className="card border-0 shadow-sm"
                        style={{
                          minWidth: 200,
                          maxWidth: 220,
                          borderRadius: "12px",
                          flex: "0 0 auto",
                          cursor: "pointer",
                          transition: "transform 0.2s ease",
                        }}
                        onClick={() => {
                          nvg(`/productdetails/${recProduct?._id}`);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        onKeyDown={event => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            nvg(`/productdetails/${recProduct?._id}`);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        <div
                          style={{
                            position: "relative",
                            overflow: "hidden",
                            borderRadius: "12px 12px 0 0",
                            paddingTop: "78%",
                            backgroundColor: "#f8f9fa",
                          }}
                        >
                          <img
                            src={imageSrc}
                            alt={recProduct?.product_name || "Recommended product"}
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            loading="lazy"
                          />
                        </div>
                        <div className="card-body d-flex flex-column" style={{ padding: "12px" }}>
                          <h6
                            className="mb-2"
                            style={{
                              fontSize: "13px",
                              fontWeight: 600,
                              color: "#2B2A29",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                            title={recProduct?.product_name}
                          >
                            {recProduct?.product_name}
                          </h6>
                          <div className="mb-2">
                            <span
                              style={{
                                color: "#059fe2",
                                fontWeight: 700,
                                fontSize: "13px",
                              }}
                            >
                              {sellingPriceLabel}
                            </span>
                            {showStrikePrice && (
                              <span
                                style={{
                                  color: "#8F9091",
                                  fontSize: "11px",
                                  marginLeft: "6px",
                                  textDecoration: "line-through",
                                }}
                              >
                                {formatInr(mrpPriceNumeric)}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            className="btn"
                            style={{
                              marginTop: "auto",
                              background: "#059fe2",
                              color: "white",
                              fontWeight: 600,
                              borderRadius: "6px",
                              padding: "8px 10px",
                              fontSize: "12px",
                              border: "none",
                            }}
                            onClick={event => {
                              event.stopPropagation();
                              addRecommendedToCart(recProduct);
                            }}
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    );
                  })
                  : (
                    <div style={{ color: "#8F9091", fontSize: "13px" }}>
                      No recommendations available right now.
                    </div>
                  )}
            </div>
            {recommendationsErrorFlag && (
              <div className="row mt-2">
                <div className="col-12">
                  <p style={{ color: "#d9534f", fontSize: "13px", marginBottom: 0 }}>
                    {recommendationsError?.data?.message || "Unable to load recommendations right now."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
      {showRelatedSection && (
        <section
          className="section-big-py-space b-g-light"
          style={{ background: "white" }}
        >
          <div className="custom-container">
            <div className="row justify-content-between align-items-center mb-3">
              <div className="col-12 col-md-6">
                <h3
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    margin: 0,
                    textTransform: "capitalize",
                  }}
                >
                  Related Products
                </h3>
              </div>
              {isRelatedLoading && (
                <div className="col-12 col-md-6 text-md-end mt-2 mt-md-0">
                  <span style={{ fontSize: "12px", color: "#8F9091" }}>
                    Loading suggestions...
                  </span>
                </div>
              )}
            </div>
            <div className="row g-3">
              {isRelatedLoading
                ? relatedPlaceholders.map(placeholderKey => (
                  <div
                    key={`related-skeleton-${placeholderKey}`}
                    className="col-6 col-lg-3"
                  >
                    <div
                      style={{
                        height: "100%",
                        minHeight: 260,
                        borderRadius: "12px",
                        background: "#f4f6f8",
                      }}
                    />
                  </div>
                ))
                : relatedProducts.length > 0
                  ? relatedProducts.map(productItem => {
                    const productImage = productItem?.product_image1
                      ? `${process.env.REACT_APP_API_IMAGE_URL}${productItem.product_image1}`
                      : fallbackRelatedImage;
                    const sellingPriceLabel = formatInr(productItem?.selling_price);
                    const mrpPriceNumeric = Number(productItem?.mrp_price);
                    const sellingPriceNumeric = Number(productItem?.selling_price);
                    const showStrikePrice =
                      Number.isFinite(mrpPriceNumeric) &&
                      Number.isFinite(sellingPriceNumeric) &&
                      mrpPriceNumeric > sellingPriceNumeric;
                    const brandLabel = productItem?.brand || "";

                    return (
                      <div
                        key={productItem?._id}
                        className="col-6 col-lg-3"
                        style={{ maxWidth: 240, flex: "0 0 auto" }}
                      >
                        <div
                          className="card h-100 border-0 shadow-sm"
                          style={{
                            borderRadius: "12px",
                            cursor: "pointer",
                            transition: "transform 0.2s ease",
                            minHeight: 240,
                          }}
                          onClick={() => {
                            nvg(`/productdetails/${productItem?._id}`);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          onKeyDown={event => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              nvg(`/productdetails/${productItem?._id}`);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }
                          }}
                          role="button"
                          tabIndex={0}
                        >
                          <div
                            style={{
                              position: "relative",
                              overflow: "hidden",
                              borderRadius: "12px 12px 0 0",
                              paddingTop: "85%",
                              backgroundColor: "#f8f9fa",
                            }}
                          >
                            <img
                              src={productImage}
                              alt={productItem?.product_name || "Related product"}
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                              loading="lazy"
                            />
                          </div>
                          <div className="card-body d-flex flex-column" style={{ padding: "12px" }}>
                            <h6
                              className="mb-2"
                              style={{
                                fontSize: "13px",
                                fontWeight: 600,
                                color: "#2B2A29",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                              title={productItem?.product_name}
                            >
                              {productItem?.product_name}
                            </h6>
                            {brandLabel && (
                              <p
                                className="mb-1"
                                style={{
                                  fontSize: "11px",
                                  color: "#8F9091",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.4px",
                                }}
                              >
                                {brandLabel}
                              </p>
                            )}
                            <div className="mb-3">
                              <span
                                style={{
                                  color: "#059fe2",
                                  fontWeight: 700,
                                  fontSize: "13px",
                                }}
                              >
                                {sellingPriceLabel}
                              </span>
                              {showStrikePrice && (
                                <span
                                  style={{
                                    color: "#8F9091",
                                    fontSize: "11px",
                                    marginLeft: "6px",
                                    textDecoration: "line-through",
                                  }}
                                >
                                  {formatInr(mrpPriceNumeric)}
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              className="btn"
                              style={{
                                marginTop: "auto",
                                border: "1px solid #059fe2",
                                color: "#059fe2",
                                fontWeight: 600,
                                borderRadius: "6px",
                                padding: "6px 10px",
                                fontSize: "12px",
                              }}
                              onClick={event => {
                                event.stopPropagation();
                                nvg(`/productdetails/${productItem?._id}`);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                            >
                              View Product
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                  : (
                    <div className="col-12">
                      <p
                        style={{
                          textAlign: "center",
                          color: "#8F9091",
                          marginBottom: 0,
                          fontSize: "13px",
                        }}
                      >
                        No related products available right now.
                      </p>
                    </div>
                  )}
            </div>
          </div>
        </section>
      )}
      <Footer />
    </>
  );
}

export default Productdetails;
