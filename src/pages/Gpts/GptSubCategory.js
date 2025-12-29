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
  UpdateGptSubCategory,
  deleteGptsubCategory,
  getGptsCategory,
  getGptsSubCategory,
} from "../../slices/gpts";
import GroupMappingModal from "../Tags/GroupMappingModal";

const customerstatus = [
  { label: "All", value: "" },
  { label: "Active", value: "active" },
  { label: "Deactivate", value: "inactive" },
];

const GptSubCategory = () => {
  document.title = "GPT Subcategory | AlarmIQ - Historian/ PIMS";

  const dispatch = useDispatch();
  const {
    gptSubCategoryCount,
    gptSubCategoryData,
    gptSubcategoryLoader,
    gptCategoryData,
  } = useSelector((state) => state.Gpt);
  const categoriesData = [
    {
      value: "",
      label: "All",
    },
    ...gptCategoryData
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
  const [additionalstatus, setAdditionalstatus] = useState(categoriesData[0]);
  const [addModal, setAddModal] = useState(false);
  const [values, setValues] = useState({});
  const [rowId, setRowId] = useState("");
  const [loader, setLoader] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [limit, setLimit] = useState(10);

  const handleOnChangeLimit = (value) => {
    setPage(1);
    setLimit(value);
  }
  const nPages = Math.ceil(gptSubCategoryCount / limit);
  const onClickOpenAddModal = () => {
    setAddModal(true);
    setRowId("");
  };

  useEffect(() => {
    setPage(1);
  }, [searchValue, customerStatus, additionalstatus]);
  useEffect(() => {
    setSearchValue("");
  }, [customerStatus]);
  useEffect(() => {
    dispatch(
      getGptsCategory({
        limit: 30,
      })
    );
  }, []);
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
    if (additionalstatus?.value) {
      params.mainCategoryId = additionalstatus.value;
    }
    if (limit) {
      params.limit = limit;
    } if (searchValue) {
      let timer;
      const makeAPICall = () => {
        dispatch(
          getGptsSubCategory({
            ...params,
          })
        );
      };
      clearTimeout(timer);
      timer = setTimeout(makeAPICall, 1000);
      return () => clearTimeout(timer);
    } else {
      dispatch(
        getGptsSubCategory({
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
      Header: "Category Name",
      accessor: (row) => row?.mainCategory?.[0]?.name ?? "-",
      filterable: false,
    },

    {
      Header: "Gpt Count",
      Cell: (cellProps) => <>{cellProps?.row?.original?.appCount || 0}</>,
    },
    {
      Header: "Created Date",
      Cell: (cellProps) => (
        <>{handleValidDate(cellProps?.row?.original?.createdAt)}</>
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
                  handleOnEdit(cellProps?.row?.original); setIsDelete(false);
                }}
              >
                <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>{" "}
                Edit
              </DropdownItem>
              <DropdownItem
                href="#"
                onClick={() => {
                  setDeleteModal(true);
                  setIsDelete(true);
                  setuserStatus({ id: cellProps?.row?.original?._id });
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
  const handleDeleteUser = () => {
    setLoader(true);
    if (isDelete) {
      const id = userStatus?.id;
      dispatch(deleteGptsubCategory(id))
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
      setLoader(true);

      dispatch(
        UpdateGptSubCategory({ id: userStatus.id, status: userStatus.status })
      )
        .then((res) => {
          if (res?.payload.success === true) {
            if (userStatus?.status !== "active") {
              toast.success("Deactive successfully");
            } else {
              toast.success("Active successfully");
            }
            setDeleteModal(false);

            dispatch(
              getGptsSubCategory({
                page,
                status: customerStatus?.value,
                search: searchValue?.trimEnd(),
                mainCategoryId: additionalstatus.value,
              })
            );
            setLoader(false);
          } else {
            setLoader(false);
            toast.error(res?.payload?.data?.message);
          }
        })
        .catch((err) => {
          setLoader(false);
          toast.error(err?.data?.message);
        });
    }
  };
  const handleOnEdit = (item) => {
    setRowId(item?._id);
    const categorydata = {
      value: item?.mainCategory?.[0]?._id,
      label: item?.mainCategory?.[0]?.name,
    };
    setValues({
      ...values,
      name: item?.name,
      category: categorydata,
      description: item?.description,
      metaTitle: item?.metaTitle || "",
      metaDescription: item?.metaDescription || "",
      metaKeywords: item?.metaKeywords || "",
      metaImg: item?.metaImg,
    });
    setAddModal(true);
  };
  return (
    <>
      {addModal && (
        <GroupMappingModal
          addModal={addModal}
          setAddModal={setAddModal}
          values={values}
          setValues={setValues}
          rowId={rowId}
          page={page}
        />
      )}
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
          onDeleteClick={() => handleDeleteUser()}
          onCloseClick={() => {
            setIsDelete(false);
            setDeleteModal(false);
          }}
          loader={loader}
        />
        <Row>
          <Col lg={12}>
            <Card id="invoiceList">
              <CardHeader className="border-0">
                <div className="d-flex align-items-center">
                  <h5 className="card-title mb-0 flex-grow-1">
                    GPT Subcategory
                  </h5>
                  {gptSubCategoryCount > 10 && <div className="flex-shrink-0">
                    <div className="d-flex gap-2 flex-wrap">
                      Show
                      <select name="pagination" style={{ width: "70px" }} value={limit} onChange={(e) => handleOnChangeLimit(Number(e.target.value))}
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
                  {gptSubcategoryLoader ? (
                    <>
                      <Loader />
                    </>
                  ) : (
                    <>
                      {gptSubCategoryData && gptSubCategoryData?.length > 0 ? (
                        <TableContainer
                          columns={columns || []}
                          data={gptSubCategoryData || []}
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
                          SearchPlaceholder="Search Subcategory..."
                          setSearchValue={setSearchValue}
                          searchValue={searchValue}
                          nPages={nPages}
                          currentPage={page}
                          setCurrentPage={setPage}
                          isPagination={gptSubCategoryCount > 10 ? true : false}
                          iscreated={true}
                          addbuttontext={"Add Subcategory"}
                          additionalstatus={additionalstatus}
                          setAdditionalstatus={setAdditionalstatus}
                          AdditionalOption={categoriesData}
                          isAdditionalStatus={true}
                          onClickOpenAddModal={onClickOpenAddModal}
                          totalDataCount={gptSubCategoryCount}
                          ispaginationshow={gptSubCategoryCount > 10 && limit < gptSubCategoryCount ? true : false}
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
                            SearchPlaceholder="Search Subcategory..."
                            setSearchValue={setSearchValue}
                            searchValue={searchValue}
                            isPagination={false}
                            iscreated={true}
                            addbuttontext={"Add Subcategory"}
                            additionalstatus={additionalstatus}
                            setAdditionalstatus={setAdditionalstatus}
                            AdditionalOption={categoriesData}
                            isAdditionalStatus={true}
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

export default GptSubCategory;
