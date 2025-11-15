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
  Button,
} from "reactstrap";
import { ToastContainer, toast } from "react-toastify";
import { getNewsLatter } from "../../slices/newsLatter";
import CommonModal from "../../Components/Common/CommonModal";
const index = () => {
  document.title = "Tool | Augmation Tech";

  const dispatch = useDispatch();
  const { newsLatterCount, newsLatterData, newsLatterLoader } = useSelector(
    (state) => state.NewsLatter
  );
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const nPages = Math.ceil(newsLatterCount / 10);

  const [viewModal, setViewModal] = useState(false);
  const [content, setContent] = useState('');
  useEffect(() => {
    setPage(1);
  }, [searchValue]);

  useEffect(() => {
    const params = {};

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
          getNewsLatter({
            ...params,
          })
        );
      };
      clearTimeout(timer);
      timer = setTimeout(makeAPICall, 1000);
      return () => clearTimeout(timer);
    } else {
      dispatch(
        getNewsLatter({
          ...params,
        })
      );
    }
  }, [searchValue, page]);
    const handleValidDate = (date) => {
      const date1 = moment(new Date(date)).format("DD MMM Y");
      return date1;
    };
  const columns = useMemo(() => [
    {
      Header: "Subject",
      Cell: (cellProps) => (
        <div className="d-flex align-items-center">
          <span>{cellProps?.row?.original?.subject}</span>
        </div>
      ),
    },
    {
      Header: "Created At",
      Cell: (cellProps) => (
        <>{handleValidDate(cellProps?.row?.original?.createdAt)}</>
      ),  
    },

    {
      Header: "Action",
      Cell: (cellProps) => {
        return (
          <Button
            type="submit"
            className="btn btn-success w-xs me-2 py-1
            px-0"
            onClick={(e) => {
              setViewModal(true)
              setContent(cellProps?.row?.original?.html);
            }}
          >
            View
          </Button>
        );
      },
    },
  ]);


  return (
    <>
      <div className="page-content">
        <Row>
          <Col lg={12}>
            <Card id="invoiceList">
              <CardHeader className="border-0">
                <div className="d-flex align-items-center">
                  <h5 className="card-title mb-0 flex-grow-1">Newsletter</h5>
                  <div className="flex-shrink-0">
                    <div className="d-flex gap-2 flex-wrap"></div>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <div>
                  {newsLatterLoader ? (
                    <>
                      <Loader />
                    </>
                  ) : (
                    <>
                      {newsLatterData && newsLatterData?.length > 0 ? (
                        <TableContainer
                          columns={columns || []}
                          data={newsLatterData || []}
                          isGlobalFilter={true}
                          customPageSize={10}
                          divClass="table-responsive mb-1"
                          tableClass="mb-0 align-middle table-borderless"
                          theadClass="table-light text-muted"
                          SearchPlaceholder="Search NewsLatter..."
                          setSearchValue={setSearchValue}
                          searchValue={searchValue}
                          isPagination={newsLatterCount > 10 ? true : false}
                          nPages={nPages}
                          currentPage={page}
                          setCurrentPage={setPage}
                          ispaginationshow={newsLatterCount > 10 ? true : false}
                          totalDataCount={newsLatterCount}
                        />
                      ) : (
                        <>
                          <TableContainer
                            columns={[]}
                            data={[]}
                            isGlobalFilter={true}
                            customPageSize={0}
                            tableClass="mb-0 align-middle table-borderless"
                            theadClass="table-light text-muted"
                            SearchPlaceholder="Search Tools..."
                            setSearchValue={setSearchValue}
                            searchValue={searchValue}
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
      <CommonModal
        body={
          <div
            className="text-start p-3 border"
            style={{
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              height: "500px",
              overflowY: "auto",
              borderRadius: "8px",
              border: "1px solid #ddd",
              scrollbarWidth: "thin",
              scrollbarColor: "#405189 #f0f0f0",
            }}
          >

            {content ? (
              <div dangerouslySetInnerHTML={{ __html: content }} />
            ) : (
              <div className="text-center">
                <h5>Oops! No content to display.</h5>
              </div>
            )}
          </div>
        }
        isOpen={viewModal}
        onSubmit={() => {
          setViewModal(false);
        }}
        onCloseClick={() => {
          setViewModal(false);
          setContent("");
        }}
        size="lg"
        header="HTML content"
      />
    </>
  );
};

export default index;
