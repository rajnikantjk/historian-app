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
} from "../../slices/tools";
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
  const [limit, setLimit] = useState(100);

  const handleOnChangeLimit =(value)=>{
    setPage(1);
    setLimit(value);
  }
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
          getTaglist()
        );
      };
      clearTimeout(timer);
      timer = setTimeout(makeAPICall, 1000);
      return () => clearTimeout(timer);
    } else {
      dispatch(
        getTaglist()
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
      accessor: (row,rowIndex) => rowIndex + 1 ?? "-",

      filterable: false,
    },
    
    {
      Header: "Tag Name",
      accessor: (row) => row?.tagName ?? "-",

      filterable: false,
    },
    {
      Header: "Server Name",
      accessor: (row) => row?.serverName ?? "-",
      filterable: false,
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
    },
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
    const requiredFields = ["serverName", "tagName"];

    requiredFields.forEach((field) => {
      if (!values?.tagName || values?.tagName.trim() === "") {
        isFormValid = false;
        newErrors["tagName"] = " Please enter a tag name";
      }
      if (!values?.serverName || values?.serverName.trim() === "") {
        isFormValid = false;
        newErrors["serverName"] = " Please enter a server name";
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
    });
    setAddModal(true);
  };
  const handleOnAddCategory = () => {
    if (formValidation()) {
      setLoader(true);

      dispatch(
      AddNewTagDetails({
          id:"0",
          tagName: values?.tagName,
          serverName: values?.serverName,
          isActive:"Y"
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
          tagName: values?.tagName,
          serverName: values?.serverName,
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
      <Modal isOpen={addModal}  id="exampleModal">
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
                Tag Name: <span className="text-danger">*</span>
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
             Server Name: <span className="text-danger">*</span>
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
            {   toolCategoryCount > 10 &&   <div className="flex-shrink-0">
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
                          divClass="table-responsive mb-1"
                          tableClass="mb-0 align-middle table-borderless"
                          theadClass="table-light text-muted"
                          SearchPlaceholder="Search Tag..."
                          setSearchValue={setSearchValue}
                          searchValue={searchValue}
                          isPagination={toolCategoryCount > 10 ? true : false}
                          nPages={nPages}
                          currentPage={page}
                          setCurrentPage={setPage}
                          iscreated={true}
                          addbuttontext={"Add New Tag"}
                          onClickOpenAddModal={onClickOpenAddModal}
                          totalDataCount={toolCategoryCount}
                          ispaginationshow={toolCategoryCount > 10 && limit <toolCategoryCount ? true : false }

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
                            iscreated={true}
                            addbuttontext={"Add New Tag"}
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

export default TagList;
