import React, { useMemo, useState } from "react";
import Breadcup from "../../components/Breadcup";
import Loadercomp from "../../components/Loadercomp";
import {
  useGetTaxesQuery,
  useCreateTaxMutation,
  useUpdateTaxMutation,
} from "../../store/api/taxapi";

const initialForm = {
  name: "GST",
  percentage: "",
  effective_from: "",
  isActive: true,
};

const TaxManager = () => {
  const { data, isLoading } = useGetTaxesQuery(true);
  const [createTax, { isLoading: creating }] = useCreateTaxMutation();
  const [updateTax, { isLoading: updating }] = useUpdateTaxMutation();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const taxes = useMemo(() => data?.data ?? [], [data]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!form.percentage || !form.effective_from) {
      setError("Percentage and effective date are required.");
      return;
    }

    try {
      await createTax({
        name: form.name || "GST",
        percentage: Number(form.percentage),
        effective_from: form.effective_from,
        isActive: form.isActive,
      }).unwrap();
      setForm(initialForm);
      setSuccessMsg("Tax record created.");
    } catch (err) {
      setError(err?.data?.errors || "Unable to create tax");
    }
  };

  const toggleActive = async (id, nextState) => {
    setError("");
    setSuccessMsg("");
    try {
      await updateTax({ id, data: { isActive: nextState } }).unwrap();
      setSuccessMsg("Tax record updated.");
    } catch (err) {
      setError(err?.data?.errors || "Unable to update tax");
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
        <Loadercomp />
      </div>
    );
  }

  return (
    <div className="container-fluid p-3">
      <Breadcup name="Tax Management" />

      <div className="row">
        <div className="col-lg-4 col-12 mb-3">
          <div className="bg-white p-3 rounded shadow-sm">
            <h6 className="mb-3">Add / Schedule Tax</h6>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            {successMsg && <div className="alert alert-success py-2">{successMsg}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Tax Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="GST"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Tax Percentage (%)</label>
                <input
                  type="number"
                  className="form-control"
                  name="percentage"
                  value={form.percentage}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Effective From</label>
                <input
                  type="date"
                  className="form-control"
                  name="effective_from"
                  value={form.effective_from}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="isActive">
                  Active
                </label>
              </div>
              <button type="submit" className="btn btn-primary w-100" disabled={creating}>
                {creating ? "Saving..." : "Save Tax"}
              </button>
            </form>
          </div>
        </div>

        <div className="col-lg-8 col-12">
          <div className="bg-white p-3 rounded shadow-sm">
            <h6 className="mb-3">Configured Taxes</h6>
            <p className="text-muted" style={{ fontSize: "13px" }}>
              The system will automatically pick the latest active tax whose effective date is on/before the order date.
            </p>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>%</th>
                    <th>Effective From</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th style={{ minWidth: "110px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {taxes.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">
                        No tax records yet.
                      </td>
                    </tr>
                  )}
                  {taxes.map((tax) => {
                    const effectiveDate = tax.effective_from ? new Date(tax.effective_from).toLocaleDateString() : "-";
                    return (
                      <tr key={tax._id}>
                        <td>{tax.name}</td>
                        <td>{tax.percentage}%</td>
                        <td>{effectiveDate}</td>
                        <td>
                          <span className={`badge ${tax.isActive ? "bg-success" : "bg-secondary"}`}>
                            {tax.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>{tax.createdAt ? new Date(tax.createdAt).toLocaleString() : "-"}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            disabled={updating}
                            onClick={() => toggleActive(tax._id, !tax.isActive)}
                          >
                            {tax.isActive ? "Disable" : "Enable"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxManager;
