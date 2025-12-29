import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMemo } from "react";
import moment from "moment";
import {
  CardBody,
  Row,
  Col,
  Card,
  CardHeader,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { ToastContainer, toast } from "react-toastify";
import { DeleteUser } from "../../slices/user";
import DeleteModal from "../../Components/Common/DeleteModal";
import TableContainer from "../../Components/Common/TableContainer";
import Loader from "../../Components/Common/Loader";
import { getTools } from "../../slices/tools";
import { useNavigate } from "react-router-dom";
import ImagePreviewModal from "../../Components/Common/ImagePreviewModal";

const customerstatus = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];
const AdditionalOption = [
  { label: "All", value: "" },
  { label: "LIVE", value: true },
  { label: "OFFLINE", value: "false" },
];
const index = () => {
  document.title = "Users Tool | AlarmIQ - Historian/ PIMS";
  const ToolRedirectLink = process.env.REACT_APP_TOOl_URL

  const dispatch = useDispatch();
  const { toolCount, toolData, toolLoader } = useSelector(
    (state) => state.Tool
  );
  const [customerStatus, setcustomerStatus] = useState(customerstatus[0]);
  const [additionalstatus, setAdditionalstatus] = useState(AdditionalOption[0]);

  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);

  const [deleteModal, setDeleteModal] = useState(false);
  const [imageModal, setImageModal] = useState(false);
  const [imageLink, setImgLink] = useState("");
  const [limit, setLimit] = useState(10);

  const handleOnChangeLimit = (value) => {
    setPage(1);
    setLimit(value);
  };
  const nPages = Math.ceil(toolCount / limit);
  const [userStatus, setuserStatus] = useState({});
  const navigate = useNavigate();
  useEffect(() => {
    setPage(1);
  }, [searchValue, customerStatus, additionalstatus]);
  useEffect(() => {
    setSearchValue("");
  }, [customerStatus]);
  useEffect(() => {
    const params = {};

    if (customerStatus?.value) {
      params.status = customerStatus.value;
    }
    if (additionalstatus?.value) {
      params.isLive = additionalstatus.value;
    }

    if (searchValue) {
      params.search = searchValue?.trimEnd();
    }
    if (page) {
      params.page = page;
    }

    params.createdBy = "user";

    if (limit) {
      params.limit = limit;
    }
    if (searchValue) {
      let timer;
      const makeAPICall = () => {
        dispatch(
          getTools({
            ...params,
          })
        );
      };
      clearTimeout(timer);
      timer = setTimeout(makeAPICall, 1000);
      return () => clearTimeout(timer);
    } else {
      dispatch(
        getTools({
          ...params,
        })
      );
    }
  }, [customerStatus, searchValue, page, additionalstatus, limit]);
  const handleValidDate = (date) => {
    const date1 = moment(new Date(date)).format("DD MMM Y");
    return date1;
  };
  const onClickDelete = (status) => {
    const data1 = {
      userid: status?._id,
      isActive: status?.isActive === true ? false : true,
    };

    setuserStatus(data1);
    setDeleteModal(true);
  };
  const handleOnOpenImage = (row) => {
    const data = {
      img: row?.icon,
      name: row?.title,
    };

    setImgLink(data);
    setImageModal(true);
  };
  const columns = useMemo(() => [
    {
      Header: "Logo",
      Cell: (cellProps) => (
        <div
          className="d-flex align-items-center"
          onClick={() => handleOnOpenImage(cellProps?.row?.original)}
        >
          <img
            src={cellProps?.row?.original?.icon}
            alt=""
            className="avatar-xs me-2"
          />
        </div>
      ),
    },

    {
      Header: "Tool Name",
      accessor: (row) => (
        <>
          {row?.status !== "rejected" ? (
            <a
              href={`${ToolRedirectLink}${row?.slugId}`}
              target="_blank"
            >
              <p style={{ "text-transform": "capitalize" }}>
                {row?.title ?? "-"}
              </p>
            </a>
          ) : (
            <>
              <p style={{ "text-transform": "capitalize" }}>
                {row?.title ?? "-"}
              </p>
            </>
          )}
        </>
      ),
    },
    {
      Header: "Status",
      accessor: (row) =>
        (
          <div
            className={
              row?.status === "pending"
                ? "text-warning"
                : row?.status === "approved"
                  ? "text-success"
                  : row?.status === "rejected"
                    ? "text-danger"
                    : null
            }
          >
            <b style={{ "text-transform": "capitalize" }}>{row?.status}</b>
          </div>
        ) ?? "-",
      filterable: false,
    },
    {
      Header: "LIVE OR OFFLINE",
      accessor: (row) =>
        (
          <div
            className={row?.isLive === false ? "text-danger" : "text-success"}
          >
            <b style={{ "text-transform": "capitalize" }}>
              {row?.isLive === true ? "LIVE" : "OFFLINE"}
            </b>
          </div>
        ) ?? "-",
      filterable: false,
    },
    {
      Header: "Add by",
      Cell: (cellProps) => (
        <p style={{ "text-transform": "capitalize" }}>
          {(cellProps?.row?.original?.user_data?.[0]?.fname || "-") +
            " " +
            (cellProps?.row?.original?.user_data?.[0]?.lname || "")}
        </p>
      ),
    },
    {
      Header: "Created Date",
      Cell: (cellProps) => (
        <>{handleValidDate(cellProps?.row?.original?.createdAt)}</>
      ),
    },
    {
      Header: "Updated Date",
      Cell: (cellProps) => (
        <>{handleValidDate(cellProps?.row?.original?.updatedAt)}</>
      ),
    },

    {
      Header: "Action",
      Cell: (cellProps) => {
        return (
          <UncontrolledDropdown>
            <DropdownToggle
              href="#"
              className="btn btn-soft-secondary btn-sm dropdown"
              tag="button"
            >
              <i className="ri-more-fill align-middle"></i>
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-end">
              <DropdownItem
                onClick={() => {
                  navigate(
                    `/update-user-tool/${cellProps?.row?.original?.slugId}`
                  );
                }}
              >
                <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>{" "}
                Edit
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        );
      },
    },
  ]);
  const handleDeleteUser = () => {
    dispatch(
      DeleteUser({ userid: userStatus.userid, status: userStatus.isActive })
    )
      .unwrap()
      .then((res) => {
        if (res?.success === true) {
          if (userStatus?.isActive === false) {
            toast.error("Deactive successfully");
          } else {
            toast.success("Active successfully");
          }
          setDeleteModal(false);
          dispatch(
            getTools({
              status: customerStatus.value,
              isLive: additionalstatus.value,
              search: searchValue?.trimEnd(),
            })
          );
        }
      })
      .catch((error) => {
        console.error("Error Deleting User:", error);
      });
  };

  return (
    <>
      <div className="page-content">
        <DeleteModal
          show={deleteModal}
          text={userStatus?.isActive === false ? "Deactive" : "Active"}
          onDeleteClick={() => handleDeleteUser()}
          onCloseClick={() => setDeleteModal(false)}
        />
        <ImagePreviewModal
          show={imageModal}
          src={imageLink?.img}
          text={imageLink.name}
          onCloseClick={() => setImageModal(false)}
        />
        <Row>
          <Col lg={12}>
            <Card id="invoiceList">
              <CardHeader className="border-0">
                <div className="d-flex align-items-center">
                  <h5 className="card-title mb-0 flex-grow-1">User Tools</h5>
                  {toolCount > 10 && (
                    <div className="flex-shrink-0">
                      <div className="d-flex gap-2 flex-wrap">
                        Show
                        <select
                          name="pagination"
                          style={{ width: "70px" }}
                          value={limit}
                          onChange={(e) =>
                            handleOnChangeLimit(Number(e.target.value))
                          }
                        >
                          <option value="10">10</option>
                          <option value="25">25</option>
                          <option value="50">50</option>
                          <option value="100">100</option>
                        </select>
                        entries
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <div>
                  {toolLoader ? (
                    <>
                      <Loader />
                    </>
                  ) : (
                    <>
                      {toolData && toolData?.length > 0 ? (
                        <TableContainer
                          columns={columns || []}
                          data={toolData || []}
                          isGlobalFilter={true}
                          isAddUserList={false}
                          customPageSize={limit}
                          isCustomerFilter={true}
                          customerstatus={customerstatus}
                          setcustomerStatus={setcustomerStatus}
                          customerStatus={customerStatus}
                          divClass="table-responsive mb-1"
                          tableClass="mb-0 align-middle table-borderless"
                          theadClass="table-light text-muted"
                          SearchPlaceholder="Search Tools..."
                          setSearchValue={setSearchValue}
                          searchValue={searchValue}
                          isPagination={toolCount > 10 ? true : false}
                          nPages={nPages}
                          currentPage={page}
                          setCurrentPage={setPage}
                          additionalstatus={additionalstatus}
                          setAdditionalstatus={setAdditionalstatus}
                          AdditionalOption={AdditionalOption}
                          isAdditionalStatus={true}
                          totalDataCount={toolCount}
                          ispaginationshow={
                            toolCount > 10 && limit < toolCount ? true : false
                          }
                        />
                      ) : (
                        <>
                          <TableContainer
                            columns={[]}
                            data={[]}
                            isGlobalFilter={true}
                            isCustomerFilter={true}
                            customPageSize={0}
                            customerstatus={customerstatus}
                            setcustomerStatus={setcustomerStatus}
                            customerStatus={customerStatus}
                            tableClass="mb-0 align-middle table-borderless"
                            theadClass="table-light text-muted"
                            SearchPlaceholder="Search Tools..."
                            setSearchValue={setSearchValue}
                            searchValue={searchValue}
                            isPagination={false}
                            additionalstatus={additionalstatus}
                            setAdditionalstatus={setAdditionalstatus}
                            AdditionalOption={AdditionalOption}
                            isAdditionalStatus={true}
                          />
                        </>
                      )}
                    </>
                  )}

                  <ToastContainer closeButton={false} limit={1} />
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default index;
