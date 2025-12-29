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
import {
  AddGptsCategory,
  EditGptsCategory,
  UpdateGptCategory,
  deleteGptCategory,
  getGptsCategory,
} from "../../slices/gpts";

const customerstatus = [
  { label: "All", value: "" },
  { label: "Active", value: "active" },
  { label: "Deactivate", value: "inactive" },
];
const GptCategory = () => {
  document.title = "GPT Category | AlarmIQ - Historian/ PIMS";

  const dispatch = useDispatch();
  const { gptCategoryCount, gptCategoryData, gptCategoryLoader } = useSelector(
    (state) => state.Gpt
  );
  const [customerStatus, setcustomerStatus] = useState(customerstatus[0]);
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [userStatus, setuserStatus] = useState({});
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [loader, setLoader] = useState(false);
  const [rowId, setRowId] = useState("");
  const [limit, setLimit] = useState(10);

  const handleOnChangeLimit = (value) => {
    setPage(1);
    setLimit(value);
  };
  const nPages = Math.ceil(gptCategoryCount / limit);
  const handleOnChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };
  const onClickOpenAddModal = () => {
    setAddModal(true);
    setRowId("");
  };
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
          getGptsCategory({
            ...params,
          })
        );
      };
      clearTimeout(timer);
      timer = setTimeout(makeAPICall, 1000);
      return () => clearTimeout(timer);
    } else {
      dispatch(
        getGptsCategory({
          ...params,
        })
      );
    }
  }, [customerStatus, searchValue, page, limit]);
  const formValidation = () => {
    let isFormValid = true;
    let newErrors = {};
    const requiredFields = ["title", "description"];
    requiredFields.forEach((field) => {
      if (!values?.title || values?.title === "") {
        isFormValid = false;
        newErrors["title"] = "Please enter name";
      }
      if (!values?.description || values?.description === "") {
        isFormValid = false;
        newErrors["description"] = "Please enter description ";
      }
    });
    setErrors(newErrors);
    return isFormValid;
  };
  const handleOnEdit = (item) => {
    setRowId(item?._id);
    setValues({
      ...values,
      title: item?.name,
      description: item?.description,
    });
    setAddModal(true);
  };
  const handleOnAddCategory = () => {
    if (formValidation()) {
      setLoader(true);

      dispatch(
        AddGptsCategory({
          name: values?.title,
          description: values?.description,
        })
      )
        .then((res) => {
          if (res?.payload?.success) {
            setAddModal(false);
            dispatch(getGptsCategory({ page: page }));
            setLoader(false);
            toast.success("Category added successfully");
            setValues({});
          } else {
            setLoader(false);
          }
        })
        .catch((err) => {
          setLoader(false);
          toast.error(err.response.data.message);
        });
    }
  };

  const handleOnUpdateCategory = () => {
    if (formValidation()) {
      setLoader(true);

      dispatch(
        EditGptsCategory({
          name: values?.title,
          description: values?.description,
          id: rowId,
        })
      )
        .then((res) => {
          if (res?.payload?.success) {
            setAddModal(false);
            setLoader(false);
            dispatch(getGptsCategory({ page: page }));
            toast.success("Category Updated Successfully");
            setValues({});
          } else {
            setLoader(false);
          }
        })
        .catch((err) => {
          setLoader(false);
          toast.error(err.response.data.message);
        });
    }
  };
  const handleValidDate = (date) => {
    const date1 = moment(new Date(date)).format("DD MMM Y");
    return date1;
  };
  const onClickDelete = (status) => {
    const data1 = {
      id: status?._id,
      status: status?.status === "active" ? "inactive" : "active",
    };

    setuserStatus(data1);
    setDeleteModal(true);
  };

  const columns = useMemo(() => [
    {
      Header: "Name",
      accessor: (row) => row?.name ?? "-",

      filterable: false,
    },
    {
      Header: "SubCategory Count",
      accessor: (row) => row?.categoryCount ?? "-",
      filterable: false,
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
      Header: "Status",
      accessor: "isActive",
      Cell: (cellProps) => {
        switch (cellProps?.row?.original.status) {
          case "active":
            return (
              <span className="badge text-uppercase badge-soft-success">
                Active
              </span>
            );
          case "inactive":
            return (
              <span className="badge text-uppercase badge-soft-danger">
                Deactivate
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
                onClick={() => {
                  handleOnEdit(cellProps?.row?.original);
                  setIsDelete(false);
                }}
              >
                <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>{" "}
                Edit
              </DropdownItem>{" "}
              <DropdownItem
                href="#"
                onClick={() => {
                  setDeleteModal(true);
                  setuserStatus({ id: cellProps?.row?.original?._id });
                  setIsDelete(true);
                }}
              >
                <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>{" "}
                Delete
              </DropdownItem>
              <DropdownItem
                href="#"
                onClick={() => {
                  onClickDelete(cellProps?.row?.original);
                  setIsDelete(false);
                }}
              >
                {cellProps?.row?.original.status === "active" ? (
                  <i className="ri-close-line align-bottom me-2 text-muted"></i>
                ) : (
                  <i className="ri-check-line align-bottom me-2 text-muted"></i>
                )}
                {cellProps?.row?.original.status === "active"
                  ? "Deactivate"
                  : "Active"}
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        );
      },
    },
  ]);

  const handleDeleteCategory = () => {
    setLoader(true);
    if (isDelete) {
      const id = userStatus?.id;
      dispatch(deleteGptCategory(id))
        .then((res) => {
          if (res?.payload.success === true) {
            toast.success("Delete successfully");
            setDeleteModal(false);
            setLoader(false);
            dispatch(
              getGptsCategory({
                page: 1,
              })
            );
            setPage(1);
          } else {
            toast.error(res?.payload?.data?.message);
            setLoader(false);
            setDeleteModal(false);
          }
        })
        .catch((err) => {
          toast.error(err?.data?.message);
          setLoader(false);
          setDeleteModal(false);
        });
    } else {
      dispatch(
        UpdateGptCategory({ id: userStatus.id, status: userStatus.status })
      )
        .then((res) => {
          if (res?.payload.success === true) {
            if (userStatus?.status !== "active") {
              toast.success("Deactive successfully");
            } else {
              toast.success("Active successfully");
            }
            setDeleteModal(false);
            setLoader(false);
            dispatch(
              getGptsCategory({
                page,
                status: customerStatus?.value,
                search: searchValue?.trimEnd(),
              })
            );
          } else {
            toast.error(res?.payload?.data?.message);
            setLoader(false);
          }
        })
        .catch((err) => {
          toast.error(err?.data?.message);
          setLoader(false);
        });
    }
  };

  return (
    <>
      <Modal isOpen={addModal} centered id="exampleModal">
        <ModalHeader
          toggle={() => {
            setAddModal(false);
            setValues({});
            setErrors({});
          }}
        >
          {rowId ? "Update GPT Category" : "Add GPT Category"}{" "}
        </ModalHeader>
        <ModalBody>
          <form>
            <div className="mb-3">
              <label htmlFor="customer-name" className="col-form-label">
                Category Name: <span className="text-danger">*</span>
                {errors.title && (
                  <span className="text-danger">{errors.title}</span>
                )}
              </label>
              <Input
                type="text"
                className="form-control"
                id="customer-name"
                name="title"
                placeholder="Enter category name"
                value={values.title}
                onChange={handleOnChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="message-text" className="col-form-label">
                Category Description: <span className="text-danger">*</span>
                {errors.description && (
                  <span className="text-danger">{errors.description}</span>
                )}
              </label>
              <textarea
                className="form-control"
                id="message-text"
                rows="4"
                name="description"
                placeholder="Enter category description"
                value={values.description}
                onChange={handleOnChange}
              ></textarea>
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
              {rowId ? "Update GPT Category" : "Add GPT Category"}
            </span>
          </Button>
        </div>
      </Modal>
      <div className="page-content">
        <DeleteModal
          show={deleteModal}
          text={
            isDelete
              ? "Delete"
              : userStatus?.status !== "active"
                ? "Deactive"
                : "Active"
          }
          onDeleteClick={() => handleDeleteCategory()}
          onCloseClick={() => {
            setDeleteModal(false);
            setIsDelete(false);
          }}
          loader={loader}
        />
        <Row>
          <Col lg={12}>
            <Card id="invoiceList">
              <CardHeader className="border-0">
                <div className="d-flex align-items-center">
                  <h5 className="card-title mb-0 flex-grow-1">GPT Category</h5>
                  {gptCategoryCount > 10 && (
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
                  {gptCategoryLoader ? (
                    <>
                      <Loader />
                    </>
                  ) : (
                    <>
                      {gptCategoryData && gptCategoryData.length > 0 ? (
                        <TableContainer
                          columns={columns || []}
                          data={gptCategoryData || []}
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
                          SearchPlaceholder="Search Category..."
                          setSearchValue={setSearchValue}
                          searchValue={searchValue}
                          isPagination={gptCategoryCount > 10 ? true : false}
                          nPages={nPages}
                          currentPage={page}
                          setCurrentPage={setPage}
                          iscreated={true}
                          addbuttontext={"Add Category"}
                          onClickOpenAddModal={onClickOpenAddModal}
                          totalDataCount={gptCategoryCount}
                          ispaginationshow={gptCategoryCount > 10 && limit < gptCategoryCount ? true : false}

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
                            SearchPlaceholder="Search Category..."
                            setSearchValue={setSearchValue}
                            searchValue={searchValue}
                            isPagination={false}
                            iscreated={true}
                            addbuttontext={"Add Category"}
                            onClickOpenAddModal={onClickOpenAddModal}
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

export default GptCategory;
