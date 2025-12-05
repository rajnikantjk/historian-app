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
} from "reactstrap";
import { ToastContainer, toast } from "react-toastify";
import DeleteModal from "../../Components/Common/DeleteModal";
import { DeleteMappingData, getTaglist, getMappedGroupList } from "../../slices/tools";
import GroupMappingModal from "./GroupMappingModal";

const customerstatus = [
  { label: "All", value: "" },
  { label: "Active", value: "active" },
  { label: "Deactivate", value: "inactive" },
];
const GroupMapping = () => {
  document.title = "Group Mapping | Augmation Tech";

  const dispatch = useDispatch();
  const { groupMappingCount, groupMappingData, toolLoader,toolCategoryData } = useSelector(
    (state) => state.Tool
  );  const categoriesData = [
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
  const [values, setValues] = useState({});
  const [rowId, setRowId] = useState("");
  const [additionalstatus, setAdditionalstatus] = useState(categoriesData[0]);
  const [loader, setLoader] = useState(false);
  const [limit, setLimit] = useState(100);
   const userRole = JSON.parse(sessionStorage.getItem("authUser"))?.role;

  const handleOnChangeLimit =(value)=>{
    setPage(1);
    setLimit(value);
  }
  const nPages = Math.ceil(groupMappingCount / limit);

  const onClickOpenAddModal = () => {
    setAddModal(true);
    setRowId("");
  };


  useEffect(() => {
    setPage(1);
  }, [searchValue, customerStatus , additionalstatus.value]);
  useEffect(() => {
    setSearchValue("");
  }, [customerStatus]);
  useEffect(() => {
    const params = {};

    if (customerStatus?.value) {
      params.status = customerStatus.value;
    }

    if (searchValue) {
      params.search = searchValue?.trimEnd()	;
    }
    if (page) {
      params.page = page;
    }  if (additionalstatus?.value) {
      params.aiToolCategoryId = additionalstatus.value;
    }
    if (limit) {
      params.limit = limit;
    }    if (searchValue) {
      let timer;
      const makeAPICall = () => {
        dispatch(
          getMappedGroupList({ page: page,
        limit: limit,
        search: searchValue})
        );
      };
      clearTimeout(timer);
      timer = setTimeout(makeAPICall, 1000);
      return () => clearTimeout(timer);
    } else {
      dispatch(
        getMappedGroupList({ page: page,
        limit: limit,
        search: searchValue})
      );
    }
  }, [customerStatus, searchValue, page , additionalstatus.value , limit]);
  const handleValidDate = (date) => {
    const date1 = moment(new Date(date)).format("DD MMM Y");
    return date1;
  };
  const onClickDelete = (status) => {
    const data1 = {
      id: status?.grpId
    };

    setuserStatus(data1);
    setDeleteModal(true);
  };
  const handleOnEdit = (item) => {
    setRowId(item?.grpId);
  
    setValues({
      ...values,
      grpId:{value:item?.grpId,label:item?.grpName},
      tagId:item?.tagName
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
      Header: "Group Id",
      accessor: (row,rowIndex) => row?.grpId ?? "-",

      filterable: false,
    },
    {
      Header: "Group Name",
      accessor: (row) => row?.grpName ?? "-",
      width: 200,
      filterable: false,
    },
    {
      Header: "Tag Name",
      accessor: (row) => row?.tagName ?? "-",
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
    }]:[{
      Header: "",
      accessor: 'emptyAction',
      Cell: () => null
    }]),
  ]);
  const handleDeleteMappingData = () => {
    setLoader(true)

    dispatch(
      DeleteMappingData({ id: userStatus.id })
    )
      .then((res) => {
        if (res?.payload?.status == 200) {
          
            toast.success("Group Mapping Deleted Successfully");
    
          setDeleteModal(false);
          setLoader(false)

          dispatch(
            getMappedGroupList()
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
          text={"Delete"}
          onDeleteClick={() => handleDeleteMappingData()}
          onCloseClick={() => setDeleteModal(false)}
          loader={loader}
        />
        <Row>
          <Col lg={12}>
            <Card id="invoiceList">
              <CardHeader className="border-0">
                <div className="d-flex align-items-center">
                  <h5 className="card-title mb-0 flex-grow-1">
                    Tag Group Mapping
                  </h5>
              {/* {   groupMappingCount > 10 &&  <div className="flex-shrink-0">
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
                      {groupMappingData &&
                      groupMappingData?.length > 0 ? (
                        <TableContainer
                          columns={columns || []}
                          data={groupMappingData || []}
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
                           ( groupMappingCount > 100 ) ? true : false
                          }
                        
                          iscreated={userRole == "ROLE_ADMIN" }
                          addbuttontext={"Add New Group Mapping"}
                          onClickOpenAddModal={onClickOpenAddModal}
                          // isAdditionalStatus={true}
                          additionalstatus={additionalstatus}
                          setAdditionalstatus={setAdditionalstatus}
                          AdditionalOption={categoriesData}
                          totalDataCount={groupMappingCount}
                          ispaginationshow={groupMappingCount > 100 && limit <groupMappingCount ? true : false }

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
                            addbuttontext={"Add New Group Mapping"}
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

export default GroupMapping;
