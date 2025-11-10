import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DeleteUser } from "../../slices/user";
import TableContainer from "../../Components/Common/TableContainer";
import { useMemo } from "react";
import moment from "moment";
import Loader from "../../Components/Common/Loader";
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
import DeleteModal from "../../Components/Common/DeleteModal";
import {
  ActiveInactiveGpts,
  UpdateGptCategory,
  UpdateGpts,
  getGpts,
} from "../../slices/gpts";
import ImagePreviewModal from "../../Components/Common/ImagePreviewModal";
import { useNavigate } from "react-router-dom";

const customerstatus = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];
const index = () => {
  document.title = "GPT | Augmation Tech";
  const GptRedirectLink = process.env.REACT_APP_GPT_URL

  const dispatch = useDispatch();
  const { gptCount, gptData, gptLoader } = useSelector((state) => state.Gpt);
  const [customerStatus, setcustomerStatus] = useState(customerstatus[0]);
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const [imageModal, setImageModal] = useState(false);
  const [imageLink, setImgLink] = useState({});
  const [deleteModal, setDeleteModal] = useState(false);
  const [userStatus, setuserStatus] = useState({});
  const [loader, setLoader] = useState(false);
  const navigate = useNavigate();
  const [limit, setLimit] = useState(10);

  const handleOnChangeLimit = (value) => {
    setPage(1);
    setLimit(value);
  };
  const nPages = Math.ceil(gptCount / limit);
  useEffect(() => {
    setPage(1);
  }, [searchValue, customerStatus]);
  useEffect(() => {
    setSearchValue("");
  }, [customerStatus]);
  useEffect(() => {
    const params = {};

    if (customerStatus?.value) {
      params.status = customerStatus.value;
    }

    if (searchValue) {
      params.search = searchValue?.trimEnd();
    }
    if (page) {
      params.page = page;
    }

    if (limit) {
      params.limit = limit;
    }
    if (searchValue) {
      let timer;
      const makeAPICall = () => {
        dispatch(
          getGpts({
            ...params,
          })
        );
      };
      clearTimeout(timer);
      timer = setTimeout(makeAPICall, 1000);
      return () => clearTimeout(timer);
    } else {
      dispatch(
        getGpts({
          ...params,
        })
      );
    }
  }, [customerStatus, searchValue, page, limit]);
  const handleValidDate = (date) => {
    const date1 = moment(new Date(date)).format("DD MMM Y");
    return date1;
  };
  const onClickDelete = (id, status) => {
    let data;
    if (status === "both") {
      data = {
        appIds: id?._id,
        status: id?.status === "rejected" ? "approved" : "rejected",
      };
    } else {
      data = {
        appIds: id,
        status: status,
      };
    }

    setuserStatus(data);
    setDeleteModal(true);
  };
  const handleOnOpenImage = (row) => {
    const data = {
      img: row?.icon,
      name: row?.projectName,
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
      Header: "Gpt Name",
      accessor: (row) => (
        <>
          {row?.status !== "rejected" ? (
            <a
              href={
                row?.slugId && `${GptRedirectLink}${row?.slugId}`
              }
              target="_blank"
            >
              <p style={{ textTransform: "capitalize" }}>
                {row.projectName ?? "-"}
              </p>
            </a>
          ) : (
            <>
              {" "}
              <p style={{ textTransform: "capitalize" }}>
                {row.projectName ?? "-"}
              </p>{" "}
            </>
          )}
        </>
      ),
      filterable: false,
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
      Header: "Author Name",
      Cell: (cellProps) => (
        <p style={{ "text-transform": "capitalize" }}>
          {cellProps?.row?.original?.authorName?.trim()
            ? cellProps?.row?.original?.authorName
            : "-"}
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
                  navigate(`/update-gpt/${cellProps?.row?.original?.slugId}`);
                }}
              >
                <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>{" "}
                Edit
              </DropdownItem>
              {cellProps?.row?.original?.status === "pending" ? (
                <>
                  <DropdownItem
                    href="#"
                    onClick={() => {
                      onClickDelete(cellProps?.row?.original?._id, "approved");
                    }}
                  >
                    <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>{" "}
                    Approved
                  </DropdownItem>
                  <DropdownItem
                    href="#"
                    onClick={() => {
                      onClickDelete(cellProps?.row?.original?._id, "rejected");
                    }}
                  >
                    <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>{" "}
                    Rejected
                  </DropdownItem>
                </>
              ) : (
                <DropdownItem
                  href="#"
                  onClick={() => {
                    onClickDelete(cellProps?.row?.original, "both");
                  }}
                >
                  <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>{" "}
                  {cellProps?.row?.original?.status === "rejected"
                    ? "Approved"
                    : "Rejected"}
                </DropdownItem>
              )}
            </DropdownMenu>
          </UncontrolledDropdown>
        );
      },
    },
  ]);
  const handleDeleteUser = () => {
    setLoader(true);

    dispatch(
      ActiveInactiveGpts({
        appIds: userStatus.appIds,
        status: userStatus.status,
      })
    )
      .then((res) => {
        if (res?.payload?.result === 0) {
          if (userStatus?.status !== "approved") {
            toast.success("Rejected successfully");
          } else {
            toast.success("Approved successfully");
          }
          setDeleteModal(false);
          setLoader(false);
          dispatch(
            getGpts({
              search: searchValue?.trimEnd(),
              status: customerStatus.value,
              page: 1,
            })
          );
        } else if (res?.payload?.status === 401) {
          toast.info("Session expired. Please log in again.");
          setLoader(false);
        }
      })
      .catch((error) => {
        setLoader(false);
        toast.error(error?.message);
      });
  };
  return (
    <>
      <div className="page-content">
        <DeleteModal
          show={deleteModal}
          text={userStatus?.status === "approved" ? "Approved" : "Rejected"}
          onDeleteClick={() => handleDeleteUser()}
          onCloseClick={() => setDeleteModal(false)}
          loader={loader}
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
                  <h5 className="card-title mb-0 flex-grow-1">GPTS</h5>
                  {gptCount > 10 && (
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
                  {gptLoader ? (
                    <>
                      <Loader />
                    </>
                  ) : (
                    <>
                      {gptData && gptData?.length > 0 ? (
                        <TableContainer
                          columns={columns || []}
                          data={gptData || []}
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
                          SearchPlaceholder="Search Gpts..."
                          setSearchValue={setSearchValue}
                          searchValue={searchValue}
                          isPagination={gptCount > 10 ? true : false}
                          nPages={nPages}
                          currentPage={page}
                          setCurrentPage={setPage}
                          totalDataCount={gptCount}
                          ispaginationshow={
                            gptCount > 10 && limit < gptCount ? true : false
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
