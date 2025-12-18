import * as Yup from "yup";

export const contactvalidation = Yup.object({
  name: Yup.string()
    .matches(/^[a-zA-Z-]+$/, "Invalid characters")
    .min(2)
    .max(25)
    .required("Please Enter First Name"),
  last_name: Yup.string()
    .matches(/^[a-zA-Z-]+$/, "Invalid characters")
    .min(2)
    .max(25)
    .required("Please Enter Last Name"),
  msg: Yup.string()
    .matches(/^[a-zA-Z0-9!. ?]+$/, "Invalid characters")
    .min(2)
    .max(200)
    .required("Send your massage"),

  email: Yup.string()
    .matches(/^[a-zA-Z0-9. @]+$/, "Invalid characters")
    .email()
    .required("Invalid Email Address")
    .max(45)
    .required("Email is required"),

  number: Yup.number()
    .min(1000000000, "Mobile number must be at least 10 digits")
    .max(9999999999, "Mobile number cannot be more than 10 digits")
    .required("Mobile Number is required"),
});
