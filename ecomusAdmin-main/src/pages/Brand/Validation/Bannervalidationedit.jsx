import * as Yup from "yup";

export const Brandvalidationedit = Yup.object({
  Brand_name: Yup.string()
    .label("Brand Name")
    .min(2)
    .max(500)
    .required("Brand Name is required"),
    Brand_alt: Yup.string()
    .label("Brand Alt")
    .min(2)
    .max(500)
    .required("Brand Alt is required"),
    Brand_link: Yup.string()
    .label("Brand Link")
    .min(2)
    .required("Brand Link is required"),
    description: Yup.string()
    .min(5)
    .required("Description is required"),
    status: Yup.string()
    .required("Status is required")
    .oneOf(["Active", "Inactive"], "Invalid Status"),
    Brand_type: Yup.string()
    .required("Status is required")
    .oneOf(["Brand", "Slider"], "Invalid Type"),
    Brand: Yup.mixed()
});
