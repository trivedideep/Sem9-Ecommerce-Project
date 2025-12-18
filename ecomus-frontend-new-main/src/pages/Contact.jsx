import React, { useState } from "react";
import Footer from '../components/Footer'
import Header from "../components/Header/Header";
import { useFormik } from "formik";
import { contactvalidation } from "../Validation/Contactvalidation";
import { usePostContactMutation } from "../store/api/contactapi";
const Contact = () => {
  const [success, setsuccess] = useState('')
  const initialValues = {
    name: '',
    last_name: '',
    email: '',
    number: '',
    msg: ''
  }

  const [postcontact] = usePostContactMutation();

  const sendinfo = async (payload, action) => {
    try {
      const response = await postcontact(payload).unwrap();
      if (response?.status === "sucessful") {
        setsuccess("success");
        action();
        setTimeout(() => {
          setsuccess("");
        }, 3000);
      } else {
        setsuccess("error");
      }
    } catch (err) {
      console.error("Failed to submit contact form", err);
      setsuccess("error");
    }
  };

  const { values, errors, touched, handleBlur, handleChange, handleSubmit } = useFormik({
    initialValues: initialValues,
    validationSchema: contactvalidation,
    onSubmit: (values, { setFieldError, resetForm }) => {
      console.log("values", values)
      const formdata = {
        fname: values.name,
        lname: values.last_name,
        emailID: values.email,
        mobile_no: values.number,
        message: values.msg,
      };
      sendinfo(formdata, resetForm)
    },


  });



  return (
    <>
      <Header />

      <div className="breadcrumb-main marginfromtop">
        <div className="container m-0">
          <div className="row">
            <div className="col">
              <div className="breadcrumb-contain">
                <div>
                  <ul>
                    <li><a href="/">home</a></li>
                    <li><i className="fa fa-angle-double-right" /></li>
                    <li><a href="javascript:void(0)">Contact</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="contact-page-section">
        <div className="container">
          <div className="sec-title">
            {/* <div className="title">Contact Us</div> */}
            <h2>Let's Get in Touch.</h2>
          </div>
          <div className="inner-container">
            <div className="row clearfix">
              {/*Form Column*/}
              <div className="form-column col-md-8 col-sm-12 col-xs-12">
                <div className="inner-column">
                  {/*Contact Form*/}
                  <div className="contact-form">
                    <form onSubmit={handleSubmit} id="contact-form">
                      <div className="row clearfix">
                        <div className="form-group col-md-6 col-sm-6 co-xs-12">
                          <label htmlFor="" style={{ margin: '0px', fontWeight: '550' }}>First Name <span style={{ color: 'red' }}>*</span></label>
                          <input type="text" style={{ outline: 'none' }} name="name" value={values.name}
                            onChange={handleChange}
                            onBlur={handleBlur} placeholder="Enter First Name" />
                          {errors.name && touched.name ? (<p className="form-group" style={{ color: 'red' }}>{errors.name}</p>) : null}

                        </div>
                        <div className="form-group col-md-6 col-sm-6 co-xs-12">
                          <label htmlFor="" style={{ margin: '0px', fontWeight: '550' }}>Last Name <span style={{ color: 'red' }}>*</span></label>
                          <input type="text" name="last_name" style={{ outline: 'none' }} value={values.last_name}
                            onChange={handleChange}
                            onBlur={handleBlur} placeholder="Enter Last Name" />
                          {errors.last_name && touched.last_name ? (<p className="form-group" style={{ color: 'red' }}>{errors.last_name}</p>) : null}

                        </div>
                        <div className="form-group col-md-6 col-sm-6 co-xs-12">
                          <label htmlFor="" style={{ margin: '0px', fontWeight: '550' }}>Email <span style={{ color: 'red' }}>*</span></label>
                          <input type="email" name="email" style={{ outline: 'none' }} value={values.email}
                            onChange={handleChange}
                            onBlur={handleBlur} placeholder="Enter Email" />
                          {errors.email && touched.email ? (<p className="form-group" style={{ color: 'red' }}>{errors.email}</p>) : null}

                        </div>
                        <div className="form-group col-md-6 col-sm-6 co-xs-12">
                          <label htmlFor="" style={{ margin: '0px', fontWeight: '550' }}>Mobile No <span style={{ color: 'red' }}>*</span></label>
                          <input type="text" name="number" style={{ outline: 'none' }} value={values.number}
                            onChange={handleChange}
                            onBlur={handleBlur} placeholder="Enter Phone No." />
                          {errors.number && touched.number ? (<p className="form-group" style={{ color: 'red' }}>{errors.number}</p>) : null}

                        </div>
                        <div className="form-group col-md-12 col-sm-12 co-xs-12">
                          <label htmlFor="" style={{ margin: '0px', fontWeight: '550' }}>Message <span style={{ color: 'red' }}>*</span></label>
                          <textarea name="msg" style={{ outline: 'none' }} value={values.msg}
                            onChange={handleChange}
                            onBlur={handleBlur} placeholder="Enter Your Massage" />
                          {errors.msg && touched.msg ? (<p className="form-group" style={{ color: 'red' }}>{errors.msg}</p>) : null}

                        </div>
                        <div className="form-group col-md-12 col-sm-12 co-xs-12">
                          <button type="submit" className="theme-btn btn-style-one">Send Now</button>
                        </div>
                        <div
                          className="col-md-12 pt-2"
                          style={{ display: success === "" ? "none" : "block" }}
                        >
                          <div
                            className={`alert alert-${success === "success" ? "success" : "danger"}`}
                            role="alert"
                          >
                            {success === "success"
                              ? "Message sent successfully."
                              : "Unable to submit message. Please try again."}
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                  {/*End Contact Form*/}
                </div>
              </div>
              {/*Info Column*/}
              <div className="info-column col-md-4 col-sm-12 col-xs-12">
                <div className="inner-column">
                  <h2>Contact Info</h2>
                  <ul className="list-info">
                    <li><i className="fas fa-globe" />505 Silver Point, Althan, Bhatar,
Surat, -395017</li>
                    <li><i className="far fa-envelope" /> deeptrivedi2002@gmail.com</li>
                    <li><i className="fas fa-phone" />6351426889 <br /></li>
                  </ul>
                  <ul className="social-icon-four">
                    <li className="follow">Follow on: </li>
                    <li><a href="#"><i className="fab fa-facebook-f" /></a></li>
                    <li><a href="#"><i className="fab fa-twitter" /></a></li>
                    <li><a href="#"><i className="fab fa-google-plus-g" /></a></li>
                    <li><a href="#"><i className="fab fa-dribbble" /></a></li>
                    <li><a href="#"><i className="fab fa-pinterest-p" /></a></li>
                  </ul>
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
export default Contact;