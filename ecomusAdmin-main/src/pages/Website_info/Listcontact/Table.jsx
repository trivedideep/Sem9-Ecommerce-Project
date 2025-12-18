import React, { useEffect, useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { AiOutlineDelete } from "react-icons/ai";
import Loadercomp from "../../../components/Loadercomp";
import { BsQuestionLg } from "react-icons/bs";
import { useContactlistQuery, useDeleteContactMutation } from "../../../store/api/webinfoapi";

const Table = () => {
  const [data, setData] = useState([]);
  const [isdelete, setisdelete] = useState(null);
  const [actionError, setActionError] = useState("");

  const colums = [
    {
      field: "serialNo",
      headerName: "S.No",
      headerAlign: "center",
      align: "center",
      flex: 0.3,
    },
    {
      field: "fullname",
      headerName: "Full Name",
      headerAlign: "center",
      align: "center",
      flex: 0.6,
    },
    {
      field: "email",
      headerName: "Email",
      headerAlign: "center",
      align: "center",
      flex: 1,
    },
    // {
    //   field: "country",
    //   headerName: "Country",
    //   headerAlign: "center",
    //   align: "center",
    //   flex: 0.7,
    // },
    {
      field: "mobile",
      headerName: "Mobile No",
      headerAlign: "center",
      align: "center",
      flex: 1,
    },
    {
      field: "message",
      headerName: "Message",
      headerAlign: "center",
      align: "left",
      flex: 2,
      renderCell: ({ value }) => (
        <span title={value} style={{ whiteSpace: "normal" }}>
          {value}
        </span>
      ),
    },
    {
      field: "formatdate",
      headerName: "Created Date & Time",
      headerAlign: "center",
      align: "center",
      flex: 1,
    },
    {
      field: "_id",
      headerName: "Action",
      headerAlign: "center",
      align: "center",
      flex: 0.8,
      sortable: false,
      renderCell: ({ row: { _id } }) => (
        <button
          type="button"
          className="btn btn-link p-0"
          onClick={() => {
            setActionError("");
            setisdelete(_id);
          }}
        >
          <AiOutlineDelete fontSize={20} color="#0C5398" />
        </button>
      ),
    },
  ];




  // delete user record start here
  const [deleteRecord] = useDeleteContactMutation();

  const deleteuser = async () => {
    if (!isdelete) return;
    try {
      await deleteRecord(isdelete).unwrap();
      setisdelete(null);
      setActionError("");
      await refetch();
    } catch (error) {
      console.error("Failed to delete contact", error);
      setActionError("Unable to delete contact. Please try again.");
    }
  };
  // delete user record end here




  // fetch all usere api start here
  const { data: userData, isLoading, refetch } = useContactlistQuery();
  useEffect(() => {
    if (userData) {
      async function fetchData() {
        try {
          const dataWithSerialNumbers = userData.data.map((row, index) => {
            let formattedDate = "-";
            const createdTimestamp = row?.createdAtISO || row?.createdAt;
            if (createdTimestamp) {
              const createdDate = new Date(createdTimestamp);
              if (!Number.isNaN(createdDate.getTime())) {
                formattedDate = createdDate.toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });
              }
            }

            return {
              ...row,
              serialNo: index + 1,
              id: row?._id || `${index + 1}`,
              fullname: `${row.firstname || ""} ${row.lastname || ""}`.trim(),
              message: row?.Message || row?.message || "-",
              formatdate: formattedDate,
            };
          });
          setData(dataWithSerialNumbers);
        } catch (error) { }
      }
      fetchData();
    }
  }, [userData]);
  // fetch all usere api start here
  return (
    <div
      className="row bg-white pb-4 rounded-bottom table-responsive"
      style={{ paddingBottom: "7rem" }}
    >
      {isLoading ? (
        <div style={{ textAlign: "center", fontWeight: "700" }}>
          <Loadercomp size={100} />
        </div>
      ) : (
        <DataGrid
          columns={colums}
          rows={data}
          density="compact"
          pageSizeOptions={[10, 20, 30, 50, 100]}
          components={{ Toolbar: GridToolbar }}
        />
      )}
      <div
        className={isdelete ? "modal fade show" : "modal fade"}
        style={{ display: isdelete ? "block" : "none" }}
        id="exampleModal1400000"
        tabindex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered ">
          <div className="modal-content">
            <BsQuestionLg className="question-logo" />
            <div className="modal-header mod-line"></div>
            <div className="modal-body">
              <div className="row gy-3 mt-2">
                <h1 className="ccedit-h">Warning</h1>
                <p className="ccedit-p">
                  Do You Really Want to Delete This Reord
                </p>
              </div>
            </div>
            <div className="modal-footer mod-line m-auto">
              <button
                type="button"
                className="btn closebtn text-white"
                onClick={deleteuser}
              >
                Proceed
              </button>
              <button
                type="button"
                className="btn text-white"
                style={{ background: "grey" }}
                onClick={() => {
                  setisdelete(null);
                }}
              >
                Cancel
              </button>
            </div>
            {actionError && (
              <div className="px-3 pb-3 text-danger text-center">
                {actionError}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Table;
