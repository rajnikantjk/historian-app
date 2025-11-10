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
import { getTools } from "../../slices/tools";

const customerstatus = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];
const index = () => {
  document.title = "Tool | Augmation Tech";

  const dispatch = useDispatch();
  const { toolCount, toolData, toolLoader } = useSelector(
    (state) => state.Tool
  );
  const [customerStatus, setcustomerStatus] = useState(customerstatus[0]);
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const nPages = Math.ceil(toolCount / 10);

  const [deleteModal, setDeleteModal] = useState(false);
  const [userStatus, setuserStatus] = useState({});
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
      params.search = searchValue;
    }
    if (page) {
      params.page = page;
    }

    params.limit = 10;

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
  }, [customerStatus, searchValue, page]);
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

  const columns = useMemo(() => [
    {
      Header: "Logo",
      Cell: (cellProps) => (
        <div className="d-flex align-items-center">
          <img
            src={cellProps?.row?.original?.icon}
            alt=""
            className="avatar-xs me-2"
          />
          {/* {cellProps?.row?.original?.profileImage ? (
            <img
              src={cellProps?.row?.original?.profileImage}
              alt=""
              className="avatar-xs rounded-circle me-2"
            />
          ) : (
            <div className="flex-shrink-0 avatar-xs me-2">
              <div className="avatar-title bg-soft-success text-success rounded-circle fs-13">
                {cellProps?.row?.original?.fname
                  .charAt(0)
                  .split(" ")
                  .slice(-1)
                  .toString()
                  .charAt(0)}
              </div>
            </div>
          )} */}
        </div>
      ),
    },

    {
      Header: "Tool Name",
      accessor: (row) =>
        <p style={{ "text-transform": "capitalize" }}>{row?.title}</p> ?? "-",

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
      Header: "Add by",
      Cell: (cellProps) => (
        <p style={{ "text-transform": "capitalize" }}>
          {cellProps?.row?.original?.createdBy}
        </p>
      ),
    },
    {
      Header: "Updated At",
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
                href="#"
                onClick={() => {
                  onClickDelete(cellProps?.row?.original);
                }}
              >
                <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>
                {cellProps?.row?.original.isActive === true
                  ? "Deactivate"
                  : "Active"}
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
            toast.success("Deactive successfully");
          } else {
            toast.success("Active successfully");
          }
          setDeleteModal(false);
          dispatch(getTools());
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
        <Row>
          <Col lg={12}>
            <Card id="invoiceList">
              <CardHeader className="border-0">
                <div className="d-flex align-items-center">
                  <h5 className="card-title mb-0 flex-grow-1">Tools</h5>
                  <div className="flex-shrink-0">
                    <div className="d-flex gap-2 flex-wrap"></div>
                  </div>
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
                          customPageSize={10}
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
                          totalDataCount={toolCount}
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
