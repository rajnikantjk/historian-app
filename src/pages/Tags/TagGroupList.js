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
  Container,
  CardHeader,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalHeader,
  ModalBody,
  Input,
  Button,
  Spinner,
} from "reactstrap";
import { ToastContainer, toast } from "react-toastify";
import DeleteModal from "../../Components/Common/DeleteModal";
import { UpdateAiSubCategory, getTaglist, getTagGroupList, AddNewGroupDetails, EditGroupDetails, DeleteGroupData } from "../../slices/tools";
import SubcategoryModal from "./GroupMappingModal";

const customerstatus = [
  { label: "All", value: "" },
  { label: "Active", value: "active" },
  { label: "Deactivate", value: "inactive" },
];
const TagGroupList = () => {
  document.title = "Tag Group List | AlarmIQ - Historian/ PIMS";

  const dispatch = useDispatch();
  const { toolSubCategoryCount, toolSubCategoryData, toolLoader, toolCategoryData } = useSelector(
    (state) => state.Tool
  ); const categoriesData = [
    {
      value: "",
      label: "All",
    },
    ...toolCategoryData
      ?.filter((item) => item?.status === "active")
      .map((item) => {
        return {
          value: item?._id,
          label: item?.name,
        };
      }),
  ];
  const [customerStatus, setcustomerStatus] = useState(customerstatus[0]);
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState(false);
  const [userStatus, setuserStatus] = useState({});
  const [addModal, setAddModal] = useState(false);
  const [values, setValues] = useState({ defaultLoad: "N" });
  const [rowId, setRowId] = useState("");
  const [additionalstatus, setAdditionalstatus] = useState(categoriesData[0]);
  const [loader, setLoader] = useState(false);
  const [limit, setLimit] = useState(100);
  const [errors, setErrors] = useState({});
  const userRole = JSON.parse(localStorage.getItem("authUser"))?.role;
  const handleOnChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues({
      ...values,
      [name]: type === 'checkbox' ? (checked ? 'Y' : 'N') : value
    });
    setErrors({ ...errors, [name]: "" });
  };

  const handleOnChangeLimit = (value) => {
    setPage(1);
    setLimit(value);
  }
  const nPages = Math.ceil(toolSubCategoryCount / limit);

  const onClickOpenAddModal = () => {
    setAddModal(true);
    setRowId("");
  };


  useEffect(() => {
    setPage(1);
  }, [searchValue, customerStatus, additionalstatus.value]);
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
    } if (additionalstatus?.value) {
      params.aiToolCategoryId = additionalstatus.value;
    }
    if (limit) {
      params.limit = limit;
    } if (searchValue) {
      let timer;
      const makeAPICall = () => {
        dispatch(
          getTagGroupList({
            page: page,
            limit: limit,
            search: searchValue
          })
        );
      };
      clearTimeout(timer);
      timer = setTimeout(makeAPICall, 1000);
      return () => clearTimeout(timer);
    } else {
      dispatch(
        getTagGroupList({
          page: page,
          limit: limit,
          search: searchValue
        })
      );
    }
  }, [customerStatus, searchValue, page, additionalstatus.value, limit]);
  const handleValidDate = (date) => {
    const date1 = moment(new Date(date)).format("DD MMM Y");
    return date1;
  };

  const formValidation = () => {
    let isFormValid = true;
    let newErrors = {};
    const requiredFields = ["grpName"];

    requiredFields.forEach((field) => {
      if (!values?.grpName || values?.grpName.trim() === "") {
        isFormValid = false;
        newErrors["grpName"] = " Please enter a group name";
      }
    });

    setErrors(newErrors);
    return isFormValid;
  };

  const handleOnAddCategory = () => {
    if (formValidation()) {
      setLoader(true);

      dispatch(
        AddNewGroupDetails({
          id: "0",
          grpName: values?.grpName,
          defaultLoad: values?.defaultLoad || "N",
          isActive: "Y"
        })
      )
        .then((res) => {
          if (res?.payload?.status == 200) {
            setAddModal(false);
            dispatch(getTagGroupList());
            setLoader(false);
            toast.success("Group added successfully");
            setValues({});
          } else {
            setLoader(false);
            toast.error(res?.payload?.data?.message);
          }
        })
        .catch((err) => {
          setLoader(false);
          toast.error(err.response.data.message);
        });
    }
  }


  const onClickDelete = (status) => {
    const data1 = {
      id: status?.id,
      status: "Delete",
    };

    setuserStatus(data1);
    setDeleteModal(true);
  };
  const handleOnEdit = (item) => {
    setRowId(item?.id);
    setValues({
      ...values,
      grpName: item?.grpName,
      defaultLoad: item?.defaultLoad || "N"
    });
    setAddModal(true);
  };
  const columns = useMemo(() => [
    {
      Header: "Sr.No",
      filterable: false,
      Cell: (cellProps) => {
        const rowIndex = cellProps.row.index;
        const currentPage = page; // Current page (1-based)
        const pageSize = limit;   // Items per page
        const serialNumber = (currentPage - 1) * pageSize + rowIndex + 1;
        return serialNumber;
      },
    },

    {
      Header: "Group Name",
      accessor: (row) => row?.grpName ?? "-",

      filterable: false,
    },
    {
      Header: "Default Group",
      accessor: (row) => row?.defaultLoad == "Y" ? "Yes" : "No" ?? "-",

      filterable: false,
    },

    ...(userRole == "ROLE_ADMIN" ? [{
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
                  handleOnEdit(cellProps?.row?.original);
                }}
              >
                <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>{" "}
                Edit
              </DropdownItem>
              <DropdownItem
                href="#"
                onClick={() => {
                  onClickDelete(cellProps?.row?.original);
                }}
              >
                <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>{" "}
                {"Delete"}
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        );
      },

    }] : [{
      Header: "",
      accessor: 'emptyAction',
      Cell: () => null
    }]
    ),

  ]);
  const handleDeleteGroup = () => {
    setLoader(true)

    dispatch(
      DeleteGroupData({ id: userStatus.id })
    )
      .then((res) => {
        if (res?.payload?.status == 200) {

          toast.success("Group Deleted Successfully");

          setDeleteModal(false);
          setLoader(false)

          dispatch(
            getTagGroupList()
          );
        } else {
          setLoader(false)
          toast.error(res?.payload?.data?.message);
        }
      })
      .catch((err) => {
        setLoader(false)
        toast.error(err?.data?.message);
      });
  };

  const handleOnUpdateCategory = () => {
    if (formValidation()) {
      setLoader(true);

      dispatch(
        EditGroupDetails({
          grpName: values?.grpName,
          defaultLoad: values?.defaultLoad || "N",
          isActive: "Y",
          id: rowId,
        })
      )
        .then((res) => {
          if (res?.payload?.status == 200) {
            setAddModal(false);
            setLoader(false);
            dispatch(getTagGroupList());
            toast.success("Group Updated Successfully");
            setValues({});
          } else {
            setLoader(false);
            toast.error(res?.payload?.data?.message);
          }
        })
        .catch((err) => {
          setLoader(false);
          setAddModal(false);
          toast.error(err.response.data.message);
        });
    }
  };

  return (
    <>

      <Modal isOpen={addModal} id="exampleModal">
        <ModalHeader
          className="bg-primary text-white"
          toggle={() => {
            setAddModal(false);
            setValues({});
            setErrors({});
          }}
          close={
            <button className="btn-close btn-close-white" onClick={() => {
              setAddModal(false);
              setValues({});
              setErrors({});
            }} />
          }
        >
          <span className="text-white">{rowId ? "Update Group" : "Add Group"}</span>
        </ModalHeader>
        <ModalBody>
          <form>
            <div className="mb-3">

              <Input
                type="text"
                className="form-control"
                placeholder="Enter Group Name"
                name="grpName"
                value={values.grpName || ""}
                onChange={handleOnChange}
              />
              {errors.grpName && (
                <div className="invalid-feedback d-block">
                  {errors.grpName}
                </div>
              )}
            </div>
            <div className="mb-3">
              <div className="form-check">
                <Input
                  type="checkbox"
                  className="form-check-input"
                  id="defaultLoad"
                  name="defaultLoad"
                  checked={values.defaultLoad === "Y"}
                  onChange={handleOnChange}
                />
                <label className="form-check-label" htmlFor="defaultLoad">
                  Set as default group
                </label>
              </div>
            </div>
          </form>
        </ModalBody>
        <div className="modal-footer">
          <Button
            color="light"
            onClick={() => {
              setAddModal(false);
              setValues({});
              setErrors({});
            }}
          >
            Close
          </Button>
          <Button
            color="primary"
            onClick={() => {
              rowId ? handleOnUpdateCategory() : handleOnAddCategory();
            }}
          >
            {loader && (
              <Spinner size="sm" className="flex-shrink-0  ">
                {" "}
                Loading...{" "}
              </Spinner>
            )}
            <span className="flex-grow-1 ms-2">
              {rowId ? "Update Group" : "Add Group"}
            </span>
          </Button>
        </div>
      </Modal>

      <div className="page-content">
        <DeleteModal
          show={deleteModal}
          text={"Delete"}
          onDeleteClick={() => handleDeleteGroup()}
          onCloseClick={() => setDeleteModal(false)}
          loader={loader}
        />
        <Row>
          <Col lg={12}>
            <Card id="invoiceList">
              <CardHeader className="border-0">
                <div className="d-flex align-items-center">
                  <h5 className="card-title mb-0 flex-grow-1">
                    Tag Group List
                  </h5>
                  {/* {   toolSubCategoryCount > 10 &&  <div className="flex-shrink-0">
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
                  </div>} */}
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
                      {toolSubCategoryData &&
                        toolSubCategoryData?.length > 0 ? (
                        <TableContainer
                          columns={columns || []}
                          data={toolSubCategoryData || []}
                          isGlobalFilter={true}
                          isAddUserList={false}
                          customPageSize={limit}
                          isCustomerFilter={true}
                          // customerstatus={customerstatus}
                          setcustomerStatus={setcustomerStatus}
                          customerStatus={customerStatus}
                          divClass="table-responsive mb-1"
                          tableClass="mb-0 align-middle table-borderless"
                          theadClass="table-light text-muted"
                          SearchPlaceholder="Search Group..."
                          setSearchValue={setSearchValue}
                          searchValue={searchValue}
                          nPages={nPages}
                          currentPage={page}
                          setCurrentPage={setPage}
                          isPagination={
                            (toolSubCategoryCount > 100) ? true : false
                          }

                          iscreated={userRole == "ROLE_ADMIN"}
                          addbuttontext={"Add New Group"}
                          onClickOpenAddModal={onClickOpenAddModal}
                          // isAdditionalStatus={true}
                          additionalstatus={additionalstatus}
                          setAdditionalstatus={setAdditionalstatus}
                          AdditionalOption={categoriesData}
                          totalDataCount={toolSubCategoryCount}
                          ispaginationshow={toolSubCategoryCount > 100 && limit < toolSubCategoryCount ? true : false}

                        />
                      ) : (
                        <>
                          <TableContainer
                            columns={[]}
                            data={[]}
                            isGlobalFilter={true}
                            isCustomerFilter={true}
                            customPageSize={0}
                            // customerstatus={customerstatus}
                            setcustomerStatus={setcustomerStatus}
                            customerStatus={customerStatus}
                            tableClass="mb-0 align-middle table-borderless"
                            theadClass="table-light text-muted"
                            SearchPlaceholder="Search Group..."
                            setSearchValue={setSearchValue}
                            searchValue={searchValue}
                            isPagination={false}
                            iscreated={userRole == "ROLE_ADMIN"}
                            addbuttontext={"Add New Group"}
                            onClickOpenAddModal={onClickOpenAddModal}
                            // isAdditionalStatus={true}
                            additionalstatus={additionalstatus}
                            setAdditionalstatus={setAdditionalstatus}
                            AdditionalOption={categoriesData}
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

export default TagGroupList;
