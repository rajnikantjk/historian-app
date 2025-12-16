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
  Spinner,
  Button,
  Input,
} from "reactstrap";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "feather-icons-react/build/IconComponents";
import DeleteModal from "../../Components/Common/DeleteModal";
import Search from "feather-icons-react/build/IconComponents/Search";
import {
  AddNewTagDetails,
  EditTagDetails,
  DeleteTagData,
  getTaglist,
  tagDataDownload,
  tagBulkImport,
} from "../../slices/tools";
import FileUploadModal from "../../Components/Common/FileUploadModal";
import { EditGptsCategory } from "../../slices/gpts";

const customerstatus = [
  { label: "All", value: "" },
  { label: "Active", value: "active" },
  { label: "Deactivate", value: "inactive" },
];
const TagList = () => {
  document.title = "Tag List | Augmation Tech";

  const dispatch = useDispatch();
  const { toolCategoryCount, toolCategoryData, toolLoader } = useSelector(
    (state) => state.Tool
  );
  const [customerStatus, setcustomerStatus] = useState(customerstatus[0]);
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState(false);
  const [userStatus, setuserStatus] = useState({});
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [loader, setLoader] = useState(false);
  const [rowId, setRowId] = useState("");
  const [addModal, setAddModal] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [limit, setLimit] = useState(100);
  const userRole = JSON.parse(localStorage.getItem("authUser"))?.role;

  const handleOnChangeLimit = (value) => {
    setPage(1);
    setLimit(value);
  }

  const handleImportTags = () => {
    setImportModal(true);
  };

  const handleFileUpload = (formData) => {
    setImportLoading(true);
    dispatch(tagBulkImport(formData))
      .then((res) => {
 
        if (res?.payload?.status == 200) {
          toast.success(res?.payload?.message || 'Tags imported successfully');
          setImportModal(false);
          dispatch(getTaglist());
        } else {
          toast.error(res?.payload?.message || 'Failed to import tags');
        }
      })
      .catch((err) => {
        console.error('Import error:', err);
        toast.error(err.response?.data?.message || 'Error importing tags');
      })
      .finally(() => {
        setImportLoading(false);
      });
  };

  const handleExportTags = () => {
    dispatch(tagDataDownload()).then((res) => {
    
          if (res?.payload) {
            const blob = new Blob([res.payload], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
    
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `taglist.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            
          }
    
        }
        ).catch((err) => {
          console.log(":err", err)
          toast.error(err);
          setLoading(false)
        })
  };
  const nPages = Math.ceil(toolCategoryCount / limit);

  const handleOnChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
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
          getTaglist(
            { page: page,
        limit: limit,
        search: searchValue}
          )
        );
      };
      clearTimeout(timer);
      timer = setTimeout(makeAPICall, 1000);
      return () => clearTimeout(timer);
    } else {
      dispatch(
        getTaglist({ page: page,
        limit: limit,
        search: searchValue})
      );
    }
  }, [customerStatus, searchValue, page, limit]);
  const handleValidDate = (date) => {
    const date1 = moment(new Date(date)).format("DD MMM Y");
    return date1;
  };
  const onClickOpenAddModal = () => {
    setAddModal(true);
    setRowId("");
  };
  const onClickDelete = (status) => {
    const data1 = {
      id: status?.id,
      status: "Delete",
    };

    setuserStatus(data1);
    setDeleteModal(true);
  };
  const handleImageChange = (event, setImage) => {
    const file = event.target.files[0];
    if (file) {
      setValues({ ...values, [event?.target?.name]: file });
      setErrors({ ...errors, icon: "" });
    }
  };
  const handleImageDelete = (name) => {
    setValues((prevState) => ({
      ...prevState,
      [name]: "",
    }));
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
      Header: "OPC Server Name",
      accessor: (row) => row?.serverName ?? "-",
      filterable: false,
    },
    {
      Header: "OPC Tag Name",
      accessor: (row) => row?.tagName ?? "-",

      filterable: false,
    },
     {
      Header: "Display TagName",
      accessor: (row) => row?.displayTagName ?? "-",
      filterable: false,
    },
    {
      Header: "Eng. Unit",
      accessor: (row) => row?.unitName ?? "-",
      filterable: false,
    },
   

    {
      Header: "Description",
      accessor: (row) => row?.description ?? "-",
      filterable: false,
    },
   
  

    ...(userRole == "ROLE_ADMIN" ? [{
      Header: "Action",
      accessor: 'actions',
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
    }]),
  ]);

  const handleDeleteCategory = () => {
    setLoader(true);

    dispatch(DeleteTagData({ id: userStatus.id }))
      .then((res) => {
        if (res?.payload?.status == 200) {

          toast.success("Tag Deleted Successfully");

          setDeleteModal(false);
          setLoader(false);

          dispatch(
            getTaglist()
          );
        } else {
          setDeleteModal(false);
          setLoader(false);
          toast.error(res?.payload?.data?.message);
        }
      })
      .catch((err) => {
        setLoader(false);
        console.log("err", err);
        toast.error(err?.error);
      });
  };
  const formValidation = () => {
    let isFormValid = true;
    let newErrors = {};
    const requiredFields = ["serverName", "tagName", "displayTagName", "unitName", "description"];

    requiredFields.forEach((field) => {
      if (!values?.tagName || values?.tagName.trim() === "") {
        isFormValid = false;
        newErrors["tagName"] = " Please enter a tag name";
      }
      if (!values?.serverName || values?.serverName.trim() === "") {
        isFormValid = false;
        newErrors["serverName"] = " Please enter a server name";
      }
      if (!values?.displayTagName || values?.displayTagName.trim() === "") {
        isFormValid = false;
        newErrors["displayTagName"] = " Please enter a display tag name";
      }
      if (!values?.unitName || values?.unitName.trim() === "") {
        isFormValid = false;
        newErrors["unitName"] = " Please enter a unit name";
      }
      if (!values?.description || values?.description.trim() === "") {
        isFormValid = false;
        newErrors["description"] = " Please enter a description";
      }

    });

    setErrors(newErrors);
    return isFormValid;
  };

  const handleOnEdit = (item) => {
    setRowId(item?.id);
    setValues({
      ...values,
      tagName: item?.tagName,
      serverName: item?.serverName,
      displayTagName: item?.displayTagName,
      unitName: item?.unitName,
      description: item?.description,
    });
    setAddModal(true);
  };
  const handleOnAddCategory = () => {
    if (formValidation()) {
      setLoader(true);

      dispatch(
        AddNewTagDetails({
          ...values,
          id: "0",
          isActive: "Y"
        })
      )
        .then((res) => {
          if (res?.payload?.status == 200) {
            setAddModal(false);
            dispatch(getTaglist());
            setLoader(false);
            toast.success("Tag added successfully");
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
  };

  const handleOnUpdateCategory = () => {
    if (formValidation()) {
      setLoader(true);

      dispatch(
        EditTagDetails({
          ...values,
          isActive: "Y",
          id: rowId,
        })
      )
        .then((res) => {
          if (res?.payload?.status == 200) {
            setAddModal(false);
            setLoader(false);
            dispatch(getTaglist());
            toast.success("Tag Updated Successfully");
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
          toggle={() => {
            setAddModal(false);
            setValues({});
            setErrors({});
          }}
        >
          {rowId ? "Update Tag" : "Add New Tag"}{" "}
        </ModalHeader>
        <ModalBody>
          <form>
           <div className="mb-3">
              <label htmlFor="customer-name" className="col-form-label">
                OPC Server Name: <span className="text-danger">*</span>
                {errors.serverName && (
                  <span className="text-danger">{errors.serverName}</span>
                )}
              </label>
              <Input
                type="text"
                className="form-control"
                id="customer-name"
                name="serverName"
                placeholder="Enter Server Name"
                value={values.serverName}
                onChange={handleOnChange}
              />
            </div>
            <div className="mb-3">


              <label htmlFor="customer-name" className="col-form-label">
               OPC Tag Name: <span className="text-danger">*</span>
                {errors.tagName && (
                  <span className="text-danger">{errors.tagName}</span>
                )}
              </label>
              <Input
                type="text"
                className="form-control"
                id="customer-name"
                name="tagName"
                placeholder="Enter Tag Name"
                value={values.tagName}
                onChange={handleOnChange}
              />
            </div>
            
            <div className="mb-3">

              <label htmlFor="customer-name" className="col-form-label">
                Display TagName: <span className="text-danger">*</span>
                {errors.displayTagName && (
                  <span className="text-danger">{errors.displayTagName}</span>
                )}
              </label>
              <Input
                type="text"
                className="form-control"
                id="customer-name"
                name="displayTagName"
                placeholder="Enter Display Tag Name"
                value={values.displayTagName}
                onChange={handleOnChange}
              />
            </div>
            <div className="mb-3">


              <label htmlFor="customer-name" className="col-form-label">
                Eng. Unit: <span className="text-danger">*</span>
                {errors.unitName && (
                  <span className="text-danger">{errors.unitName}</span>
                )}
              </label>
              <Input
                type="text"
                className="form-control"
                id="customer-name"
                name="unitName"
                placeholder="Enter Tag Name"
                value={values.unitName}
                onChange={handleOnChange}
              />
            </div>
            <div className="mb-3">

              <label htmlFor="customer-name" className="col-form-label">
                Tag Description: <span className="text-danger">*</span>
                {errors.description && (
                  <span className="text-danger">{errors.description}</span>
                )}
              </label>
              <Input
                type="textarea"
                className="form-control"
                id="customer-name"
                name="description"
                placeholder="Enter Description"
                value={values.description}
                onChange={handleOnChange}
              />

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
              {rowId ? "Update Tag" : "Add Tag"}
            </span>
          </Button>
        </div>
      </Modal>
      <div className="page-content">
        <DeleteModal
          show={deleteModal}
          text={"Delete"}
          onDeleteClick={() => handleDeleteCategory()}
          onCloseClick={() => setDeleteModal(false)}
          loader={loader}
        />
        <Row>
          <Col lg={12}>
            <Card id="invoiceList">
              
              <CardHeader className="border-0">
                <div className="d-flex align-items-center">
                  <h5 className="card-title mb-0 flex-grow-1">Tag List</h5>
                  {/* {toolCategoryCount > 10 && (
                    <div className="flex-shrink-0">
                      <div className="d-flex gap-2 flex-wrap align-items-center">
                        Show
                        <select 
                          name="pagination" 
                          className="form-select form-select-sm" 
                          style={{ width: "80px" }} 
                          value={limit} 
                          onChange={(e) => handleOnChangeLimit(Number(e.target.value))}
                        >
                          <option value="10">10</option>
                          <option value="25">25</option>
                          <option value="50">50</option>
                          <option value="100">100</option>
                        </select>
                        <span>entries</span>
                      </div>
                    </div>
                  )} */}
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
                      {toolCategoryData && toolCategoryData.length > 0 ? (
                        <TableContainer
                          columns={columns || []}
                          data={toolCategoryData || []}
                          isGlobalFilter={true}
                          isAddUserList={false}
                          customPageSize={limit}
                          isCustomerFilter={true}
                          // customerstatus={customerstatus}
                          setcustomerStatus={setcustomerStatus}
                          customerStatus={customerStatus}
                          customButtons={userRole == "ROLE_ADMIN" ?[
                            {
                              color: 'soft-primary',
                              icon: 'upload-2-line',
                              text: 'Bulk Upload Tags',
                              onClick: handleImportTags,
                              className: 'me-2'
                            },
                            {
                              color: 'soft-success',
                              icon: 'download-2-line',
                              text: 'Export Tags',
                              onClick: handleExportTags,
                              className: 'me-2'
                            }
                          ]:[]}
                          divClass="table-responsive mb-1"
                          tableClass="mb-0 align-middle table-borderless"
                          theadClass="table-light text-muted"
                          SearchPlaceholder="Search Tag..."
                          setSearchValue={setSearchValue}
                          searchValue={searchValue}
                          isPagination={toolCategoryCount > 100 ? true : false}
                          nPages={nPages}
                          currentPage={page}
                          setCurrentPage={setPage}
                          iscreated={userRole == "ROLE_ADMIN"}
                          addbuttontext={"Add New Tag"}
                          onClickOpenAddModal={onClickOpenAddModal}
                          totalDataCount={toolCategoryCount}
                          ispaginationshow={toolCategoryCount > 100 && limit < toolCategoryCount ? true : false}

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
                            SearchPlaceholder="Search Tag..."
                            setSearchValue={setSearchValue}
                            searchValue={searchValue}
                            isPagination={false}
                            iscreated={userRole == "ROLE_ADMIN"}
                            addbuttontext={"Add New Tag"}
                             customButtons={userRole == "ROLE_ADMIN" ?[
                            {
                              color: 'soft-primary',
                              icon: 'upload-2-line',
                              text: 'Bulk Upload Tags',
                              onClick: handleImportTags,
                              className: 'me-2'
                            },
                            {
                              color: 'soft-success',
                              icon: 'download-2-line',
                              text: 'Export Tags',
                              onClick: handleExportTags,
                              className: 'me-2'
                            }
                          ]:[]}
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
      
      <FileUploadModal 
        isOpen={importModal}
        toggle={() => setImportModal(false)}
        onFileUpload={handleFileUpload}
        loading={importLoading}
      />
    </>
  );
};

export default TagList;
