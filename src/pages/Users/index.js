import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DeleteUser, getUsers } from "../../slices/user";
import TableContainer from "../../Components/Common/TableContainer";
import { useMemo } from "react";
import moment from "moment";
import Loader from "../../Components/Common/Loader";
import {
  CardBody,
  Row,
  Col,
  Card,
  Container,
  CardHeader,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "feather-icons-react/build/IconComponents";
import DeleteModal from "../../Components/Common/DeleteModal";
import Search from "feather-icons-react/build/IconComponents/Search";
import { useNavigate } from "react-router-dom";

const customerstatus = [
  { label: "All", value: "" },
  { label: "Active", value: true },
  { label: "Deactive", value: "false" },
];
const index = () => {
  const dispatch = useDispatch();
  document.title = "User | Augmation Tech";

  const { userCount, userData, userLoader, error } = useSelector(
    (state) => state.User
    );
  const history = useNavigate();

  const [customerStatus, setcustomerStatus] = useState(customerstatus[0]);
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState(false);
  const [loader, setLoader] = useState(false);
  const [limit, setLimit] = useState(10);
  const nPages = Math.ceil(userCount / limit);

  const handleOnChangeLimit =(value)=>{
    setPage(1);
    setLimit(value);
  }

  const [userStatus, setuserStatus] = useState({});
  useEffect(() => {
    setPage(1);
  }, [searchValue, customerStatus]);
  useEffect(() => {
    const params = {};

    if (customerStatus?.value) {
      params.isActive = customerStatus.value;
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
          getUsers({
            ...params,
          })
        )
          .then((res) => {
            if (res?.payload?.status === 401) {
              toast.info("Session expired. Please log in again.");
              localStorage.clear();
              sessionStorage.clear();
              history("/login");
            }
          })
          .catch((err) => {});
      };
      clearTimeout(timer);
      timer = setTimeout(makeAPICall, 1000);
      return () => clearTimeout(timer);
    } else {
      dispatch(
        getUsers({
          ...params,
        })
      )
        .then((res) => {
          if (res?.payload?.status === 401) {
            toast.info("Session expired. Please log in again.");
            localStorage.clear();
            sessionStorage.clear();
            history("/login");
          }
        })
        .catch((err) => {});
    }
  }, [customerStatus, searchValue, page , limit]);
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
      Header: "User Profile",
      Cell: (cellProps) => (
        <div className="d-flex align-items-center">
          {cellProps?.row?.original?.profileImage ? (
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
          )}
          {(cellProps?.row?.original?.fname || "") +
            " " +
            (cellProps?.row?.original?.lname || "")}
        </div>
      ),
    },

    {
      Header: "Email",
      accessor: (row) => row?.email ?? "-",
    },
    {
      Header: "Country",
      accessor: (row) => {
        const countryKey = row?.countryKey;
        return countryKey ? countryKey : "-";
      },
    },

    {
      Header: "Created At",
      Cell: (cellProps) => (
        <>{handleValidDate(cellProps?.row?.original?.createdAt)}</>
      ),
    },
    {
      Header: "Updated At",
      Cell: (cellProps) => (
        <>{handleValidDate(cellProps?.row?.original?.updatedAt)}</>
      ),
    },
    {
      Header: "STATUS",
      accessor: "isActive",
      Cell: (cellProps) => {
        switch (cellProps?.row?.original.isActive) {
          case true:
            return (
              <span className="badge text-uppercase badge-soft-success">
                Active
              </span>
            );
          case false:
            return (
              <span className="badge text-uppercase badge-soft-danger">
                Deactive
              </span>
            );
          default:
            return (
              <span className="badge text-uppercase badge-soft-info">
                Unknown
              </span>
            );
        }
      },
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
    setLoader(true);
    dispatch(
      DeleteUser({ userid: userStatus.userid, isActive: userStatus.isActive })
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
          dispatch(
            getUsers({
              search: searchValue?.trimEnd(),
              page: 1,
              isActive: customerStatus.value,
            })
          );
          setLoader(false);
        } else {
          toast.error(res?.payload?.data?.message);
          setLoader(false);
        }
      })
      .catch((error) => {
        toast.error(error?.data?.message);
        setLoader(false);
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
          loader={loader}
        />
        <Row>
          <Col lg={12}>
            <Card id="invoiceList">
              <CardHeader className="border-0">
                <div className="d-flex align-items-center">
                  <h5 className="card-title mb-0 flex-grow-1">Users</h5>
               {userCount > 10 &&   <div className="flex-shrink-0">
                    <div className="d-flex gap-2 flex-wrap">
                      Show
                      <select name="pagination" style={{width:"70px"}}  value={limit}       onChange={(e) => handleOnChangeLimit(Number(e.target.value))}
                      >
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                      </select>
                      entries
                    </div>
                  </div>}
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <div>
                  {userLoader ? (
                    <>
                      <Loader />
                    </>
                  ) : (
                    <>
                      {userData && userData.length ? (
                        <TableContainer
                          columns={columns || []}
                          data={userData || []}
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
                          SearchPlaceholder="Search User..."
                          setSearchValue={setSearchValue}
                          searchValue={searchValue}
                          isPagination={userCount > 10 ? true : false}
                          nPages={nPages}
                          currentPage={page}
                          setCurrentPage={setPage}
                          totalDataCount={userCount}
                          ispaginationshow={userCount > 10 && limit <userCount ? true : false }

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
                            SearchPlaceholder="Search User..."
                            setSearchValue={setSearchValue}
                            searchValue={searchValue}
                            isPagination={userCount > 10 ? true : false}
                          />
                        </>
                      )}
                    </>
                  )}
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
