import React, { useMemo, useRef, useState } from "react";
import "../../../../node_modules/bootstrap/dist/css/bootstrap.min.css";
import { Field, Form, Formik } from "formik";
import {
  useGetWebinfoQuery,
  usePatchWebinfoMutation,
  useCreateWebinfoMutation,
} from "../../../store/api/webinfoapi";
import { Webinfovalidation } from "../Validation/Webinfovalidation";
import Loadercomp from "../../../components/Loadercomp";
const Webinfoform = () => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetWebinfoQuery();
  const imageInputRef = useRef(null);
  const [showstatus, setshowstatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusVariant, setStatusVariant] = useState("success");

  // Edit Webinfo api start here
  const [patchwebinfo] = usePatchWebinfoMutation();
  const [createWebinfo] = useCreateWebinfoMutation();

  const WebinfoForm = async (value, isUpdate) => {
    try {
      const mutation = isUpdate ? patchwebinfo : createWebinfo;
      const response = await mutation({ data: value });

      if (response.error) {
        throw response.error;
      }

      const successMessage = isUpdate
        ? "Website info updated successfully."
        : "Website info created successfully.";

      setStatusVariant("success");
      setStatusMessage(successMessage);
      setshowstatus(true);

      await refetch();

      setTimeout(() => {
        setshowstatus(false);
        setStatusMessage("");
      }, 5000);
    } catch (error) {
      console.error("Failed to submit website info", error);
      setStatusVariant("danger");
      setStatusMessage("Unable to save website info. Please try again.");
      setshowstatus(true);
      setTimeout(() => {
        setshowstatus(false);
        setStatusMessage("");
      }, 5000);
    }
  };
  // Edit Webinfo api end here

  const info = useMemo(() => {
    return data?.data?.[0] || null;
  }, [data]);

  const initialValues = useMemo(
    () => ({
      website_name: info?.website_name || "",
      mobile_no: info?.mobile_no || "",
      address: info?.address || "",
      email: info?.email || "",
      facebook: info?.facebook || "",
      instagram: info?.instagram || "",
      twitter: info?.twitter || "",
      youtube: info?.youtube || "",
      pinterest: info?.pinterest || "",
      gstno: info?.gstno || "",
      logo: info?.logo || "",
    }),
    [info]
  );

  if (isLoading) {
    return (
      <div className="container-fuild pb-4 pt-3 px-2 bg-white d-flex justify-content-center">
        <Loadercomp size={100} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container-fuild pb-4 pt-3 px-2 bg-white">
        <div className="alert alert-danger" role="alert">
          Unable to load website info.
          {error?.status ? ` (Error ${error.status})` : ""}
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            refetch();
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const resolveLogoPreview = (logoValue) => {
    if (!logoValue) {
      return "";
    }

    if (typeof logoValue === "string") {
      return `http://localhost:8000/uploads/images/${logoValue}`;
    }

    return URL.createObjectURL(logoValue);
  };

  return (
    <div className="container-fuild pb-4 pt-3 px-2 bg-white">
      {showstatus === true ? (
        <div
          className={`col-12 alert alert-${statusVariant} mt-3 ml-2`}
          role="alert"
        >
          <h5 style={{ padding: "0px", margin: "0px" }}>
            {statusMessage}
          </h5>
        </div>
      ) : (
        <div></div>
      )}
      {!info && (
        <div className="col-12 alert alert-info mt-3 ml-2" role="alert">
          Website info has not been configured yet. Please add your details
          below.
        </div>
      )}
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={Webinfovalidation}
        onSubmit={(values) => {
          const isUpdate = Boolean(info);
          if (!isUpdate && !(values.logo instanceof File)) {
            setStatusVariant("danger");
            setStatusMessage("Logo is required when creating website info.");
            setshowstatus(true);
            setTimeout(() => {
              setshowstatus(false);
              setStatusMessage("");
            }, 5000);
            return;
          }
          const formdata = new FormData();
          formdata.append("website_name", values.website_name);
          formdata.append("mobile_no", values.mobile_no);
          formdata.append("address", values.address);
          formdata.append("email", values.email);
          formdata.append("gstno", values.gstno);
          formdata.append("facebook", values.facebook);
          formdata.append("instagram", values.instagram);
          formdata.append("youtube", values.youtube);
          formdata.append("twitter", values.twitter);
          formdata.append("pinterest", values.pinterest);
          if (values.logo && values.logo !== info?.logo) {
            formdata.append("logo", values.logo);
          } else if (!isUpdate && values.logo instanceof File) {
            formdata.append("logo", values.logo);
          }
          WebinfoForm(formdata, isUpdate);
        }}
      >
        {({ values, errors, handleSubmit, touched, setFieldValue }) => {
          const logoPreview = resolveLogoPreview(values.logo);
          const submitLabel = info ? "Update" : "Save";

          return (
            <Form autoComplete="off" onSubmit={handleSubmit}>
              <div
                className="row bg-white pb-4 round"
                style={{
                  border: "1px solid #E0E0E0",
                  margin: "10px 0px",
                  borderRadius: "3px",
                  position: "relative",
                }}
              >
                <div className="col-md-6 px-2 pt-4">
                  <div className="row">
                    <div className="col-lg-4">
                      <label htmlFor="" className="form-label">
                        Website Name <span style={{ color: "red" }}>*</span>
                      </label>
                    </div>
                    <div className="col-lg-8">
                      <Field
                        type="text"
                        name="website_name"
                        className="form-control"
                        placeholder="Website Name"
                        value={values.website_name}
                      />
                    </div>
                    <div className="offset-lg-4 col-lg-8">
                      {errors.website_name && touched.website_name ? (
                        <p style={{ color: "red" }}>{errors.website_name}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="col-md-6 px-2 pt-4">
                  <div className="row">
                    <div className="col-lg-4">
                      <label htmlFor="" className="form-label">
                        Email<span style={{ color: "red" }}>*</span>
                      </label>
                    </div>
                    <div className="col-lg-8">
                      <Field
                        name="email"
                        type="email"
                        className="form-control"
                        placeholder="Email"
                        value={values.email}
                      />
                    </div>
                    <div className="offset-lg-4 col-lg-8">
                      {errors.email && touched.email ? (
                        <p style={{ color: "red" }}>{errors.email}</p>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="col-md-6 px-2 pt-3">
                  <div className="row">
                    <div className="col-lg-4">
                      <label htmlFor="" className="form-label">
                        Mobile No <span style={{ color: "red" }}>*</span>{" "}
                      </label>
                    </div>
                    <div className="col-lg-8">
                      <Field
                        name="mobile_no"
                        type="number"
                        className="form-control"
                        placeholder="Mobile No"
                        value={values.mobile_no}
                      />
                    </div>
                    <div className="offset-lg-4 col-lg-8">
                      {errors.mobile_no && touched.mobile_no ? (
                        <p style={{ color: "red" }}>{errors.mobile_no}</p>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="col-md-6 px-2 pt-3">
                  <div className="row">
                    <div className="col-lg-4">
                      <label htmlFor="" className="form-label">
                        GST No <span style={{ color: "red" }}>*</span>{" "}
                      </label>
                    </div>
                    <div className="col-lg-8">
                      <Field
                        name="gstno"
                        type="text"
                        className="form-control"
                        placeholder="GST No"
                        value={values.gstno}
                      />
                    </div>
                    <div className="offset-lg-4 col-lg-8">
                      {errors.gstno && touched.gstno ? (
                        <p style={{ color: "red" }}>{errors.gstno}</p>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="col-md-6 px-2 pt-3">
                  <div className="row">
                    <div className="col-lg-4">
                      <label htmlFor="" className="form-label ">
                        Address <span style={{ color: "red" }}>*</span>{" "}
                      </label>
                    </div>
                    <div className="col-lg-8">
                      <Field
                        name="address"
                        type="text"
                        className="form-control"
                        placeholder="Address"
                      />
                    </div>
                    <div className="offset-lg-4 col-lg-8">
                      {errors.address && touched.address ? (
                        <p style={{ color: "red" }}>{errors.address}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="col-md-6 px-2 pt-3">
                  <div className="row">
                    <div className="col-lg-4">
                      <label htmlFor="" className="form-label ">
                        Facebook <span style={{ color: "red" }}>*</span>{" "}
                      </label>
                    </div>
                    <div className="col-lg-8">
                      <Field
                        name="facebook"
                        type="text"
                        className="form-control"
                        placeholder="Facebook"
                      />
                    </div>
                    <div className="offset-lg-4 col-lg-8">
                      {errors.facebook && touched.facebook ? (
                        <p style={{ color: "red" }}>{errors.facebook}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="col-md-6 px-2 pt-3">
                  <div className="row">
                    <div className="col-lg-4">
                      <label htmlFor="" className="form-label ">
                        Instagram <span style={{ color: "red" }}>*</span>{" "}
                      </label>
                    </div>
                    <div className="col-lg-8">
                      <Field
                        name="instagram"
                        type="text"
                        className="form-control"
                        placeholder="Instagram"
                      />
                    </div>
                    <div className="offset-lg-4 col-lg-8">
                      {errors.instagram && touched.instagram ? (
                        <p style={{ color: "red" }}>{errors.instagram}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="col-md-6 px-2 pt-3">
                  <div className="row">
                    <div className="col-lg-4">
                      <label htmlFor="" className="form-label ">
                        Youtube <span style={{ color: "red" }}>*</span>{" "}
                      </label>
                    </div>
                    <div className="col-lg-8">
                      <Field
                        name="youtube"
                        type="text"
                        className="form-control"
                        placeholder="Youtube"
                      />
                    </div>
                    <div className="offset-lg-4 col-lg-8">
                      {errors.youtube && touched.youtube ? (
                        <p style={{ color: "red" }}>{errors.youtube}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="col-md-6 px-2 pt-3">
                  <div className="row">
                    <div className="col-lg-4">
                      <label htmlFor="" className="form-label ">
                        Twitter <span style={{ color: "red" }}>*</span>{" "}
                      </label>
                    </div>
                    <div className="col-lg-8">
                      <Field
                        name="twitter"
                        type="text"
                        className="form-control"
                        placeholder="Twitter"
                      />
                    </div>
                    <div className="offset-lg-4 col-lg-8">
                      {errors.twitter && touched.twitter ? (
                        <p style={{ color: "red" }}>{errors.twitter}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="col-md-6 px-2 pt-3">
                  <div className="row">
                    <div className="col-lg-4">
                      <label htmlFor="" className="form-label ">
                        Pinterest <span style={{ color: "red" }}>*</span>{" "}
                      </label>
                    </div>
                    <div className="col-lg-8">
                      <Field
                        name="pinterest"
                        type="text"
                        className="form-control"
                        placeholder="Pinterest"
                      />
                    </div>
                    <div className="offset-lg-4 col-lg-8">
                      {errors.pinterest && touched.pinterest ? (
                        <p style={{ color: "red" }}>{errors.pinterest}</p>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="col-12 pt-3">
                  <div className="row">
                    <div className="col-lg-12">
                      <label htmlFor="" className="form-label ">
                        Logo <span style={{ color: "red" }}>*</span>{" "}
                      </label>
                    </div>
                    <div className="col-12">
                      <div className="border d-flex justify-content-center">
                        <button
                          type="button"
                          style={{
                            border: "none",
                            outline: "none",
                          }}
                        >
                          <input
                            type="file"
                            name="logo"
                            style={{ display: "none" }}
                            ref={imageInputRef}
                            accept="image/*"
                            onChange={(event) => {
                              setFieldValue("logo", event.currentTarget.files[0]);
                            }}
                          />
                          {logoPreview ? (
                            <img
                              src={logoPreview}
                              alt="Website logo preview"
                              width="100%"
                              height="200px"
                              onClick={() => {
                                imageInputRef.current.click();
                              }}
                              style={{ cursor: "pointer", objectFit: "contain" }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "100%",
                                height: "200px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "#f2f2f2",
                                color: "#666",
                                fontWeight: 500,
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                imageInputRef.current.click();
                              }}
                            >
                              Click to upload logo
                            </div>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="col-lg-12">
                      {errors.logo && touched.logo ? (
                        <p style={{ color: "red" }}>{errors.logo}</p>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div
                  className="col-12 py-5 px-4 d-flex justify-content-end"
                  style={{ gap: "4px" }}
                >
                  {/* <button className="btn4">Cancel</button> */}
                  <button
                    type="submit"
                    className="btn5"
                    style={{ background: "#0e5da9" }}
                  >
                    {submitLabel}
                  </button>
                </div>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default Webinfoform;
