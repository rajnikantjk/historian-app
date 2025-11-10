import React, { Fragment } from "react";
import PropTypes from "prop-types";
import {
  useTable,
  useGlobalFilter,
  useSortBy,
  useFilters,
  useExpanded,
  usePagination,
  useRowSelect,
} from "react-table";
import { Table, Row, Col, Button, CardBody } from "reactstrap";
import { DefaultColumnFilter } from "./filters";
import {
  ProductsGlobalFilter,
  CustomersGlobalFilter,
  OrderGlobalFilter,
  ContactsGlobalFilter,
  CompaniesGlobalFilter,
  LeadsGlobalFilter,
  CryptoOrdersGlobalFilter,
  InvoiceListGlobalSearch,
  TicketsListGlobalFilter,
  NFTRankingGlobalFilter,
  TaskListGlobalFilter,
} from "../../Components/Common/GlobalSearchFilter";

// Define a default UI for filtering
function GlobalFilter({
  globalFilter,
  setGlobalFilter,
  isCustomerFilter,
  isOrderFilter,
  isContactsFilter,
  isCompaniesFilter,
  isCryptoOrdersFilter,
  isInvoiceListFilter,
  isTicketsListFilter,
  isNFTRankingFilter,
  isTaskListFilter,
  isProductsFilter,
  isLeadsFilter,
  SearchPlaceholder,
  customerstatus,
  setcustomerStatus,
  customerStatus,
  setSearchValue,
  searchValue,
  iscreated,
  addbuttontext,
  additionalstatus,
  setAdditionalstatus,
  AdditionalOption,
  isAdditionalStatus,
  onClickOpenAddModal,
}) {
  const onChange = (value) => {
    setSearchValue(value);
  };

  return (
    <React.Fragment>
      <CardBody className="border border-dashed border-end-0 border-start-0">
        <form>
          <Row>
            <Col sm={5}>
              <div
                className={
                  isProductsFilter ||
                  isContactsFilter ||
                  isCompaniesFilter ||
                  isNFTRankingFilter
                    ? "search-box me-2 mb-2 d-inline-block"
                    : "search-box me-2 mb-2 d-inline-block col-12"
                }
              >
                <input
                  onChange={(e) => {
                    onChange(e.target.value);
                  }}
                  id="search-bar-0"
                  type="text"
                  className="form-control search /"
                  placeholder={SearchPlaceholder}
                  value={searchValue || ""}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === " ") {
                      e.preventDefault();
                    }
                  }}
                  autoComplete="off"
                />
                <i className="bx bx-search-alt search-icon"></i>
              </div>
            </Col>

            {isProductsFilter && <ProductsGlobalFilter />}
            {isCustomerFilter && (
              <CustomersGlobalFilter
                customerstatus={customerstatus}
                setcustomerStatus={setcustomerStatus}
                customerStatus={customerStatus}
                iscreated={iscreated}
                addbuttontext={addbuttontext}
                additionalstatus={additionalstatus}
                setAdditionalstatus={setAdditionalstatus}
                AdditionalOption={AdditionalOption}
                isAdditionalStatus={isAdditionalStatus}
                onClickOpenAddModal={onClickOpenAddModal}
              />
            )}
            {isOrderFilter && <OrderGlobalFilter />}
            {isContactsFilter && <ContactsGlobalFilter />}
            {isCompaniesFilter && <CompaniesGlobalFilter />}
            {isLeadsFilter && <LeadsGlobalFilter />}
            {isCryptoOrdersFilter && <CryptoOrdersGlobalFilter />}
            {isInvoiceListFilter && <InvoiceListGlobalSearch />}
            {isTicketsListFilter && <TicketsListGlobalFilter />}
            {isNFTRankingFilter && <NFTRankingGlobalFilter />}
            {isTaskListFilter && <TaskListGlobalFilter />}
          </Row>
        </form>
      </CardBody>
    </React.Fragment>
  );
}

const TableContainer = ({
  columns,
  data,
  isGlobalSearch,
  isGlobalFilter,
  isProductsFilter,
  isCustomerFilter,
  isOrderFilter,
  isContactsFilter,
  isCompaniesFilter,
  isLeadsFilter,
  isCryptoOrdersFilter,
  isInvoiceListFilter,
  isTicketsListFilter,
  isNFTRankingFilter,
  isTaskListFilter,
  isAddOptions,
  iscreated,
  isAddUserList,
  handleOrderClicks,
  handleUserClick,
  handleCustomerClick,
  isAddCustList,
  customPageSize,
  tableClass,
  theadClass,
  trClass,
  thClass,
  divClass,
  SearchPlaceholder,
  customerstatus,
  setcustomerStatus,
  customerStatus,
  setSearchValue,
  searchValue,
  isPagination,
  nPages,
  currentPage,
  setCurrentPage,
  addbuttontext,
  additionalstatus,
  setAdditionalstatus,
  AdditionalOption,
  isAdditionalStatus,
  onClickOpenAddModal,
  totalDataCount,
  ispaginationshow,
}) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    setPageSize,
    state,
    preGlobalFilteredRows,
    setGlobalFilter,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      defaultColumn: { Filter: DefaultColumnFilter },
      initialState: {
        pageIndex: 0,
        pageSize: customPageSize,
        selectedRowIds: 0,
      },
    },
    useGlobalFilter,
    useFilters,
    useSortBy,
    useExpanded,
    usePagination,
    useRowSelect
  );

  const getTotalPages = () => {
    return Math.ceil(totalDataCount / pageSize);
  };
  const getPageStartIndex = () => {
    return pageIndex * pageSize + 1;
  };

  const getPageEndIndex = () => {
    return Math.min((pageIndex + 1) * pageSize, totalDataCount);
  };

  const pageNumbers = Array.from({ length: nPages }, (_, i) => i + 1);
  const generateSortingIndicator = (column) => {
    return column.isSorted ? (column.isSortedDesc ? " " : "") : "";
  };

  const onChangeInSelect = (event) => {
    setPageSize(Number(event.target.value));
  };

  return (
    <Fragment>
      <Row className="mb-3">
        {isGlobalSearch && (
          <Col md={1}>
            <select
              className="form-select"
              value={pageSize}
              onChange={onChangeInSelect}
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </select>
          </Col>
        )}
        {isGlobalFilter && (
          <GlobalFilter
            preGlobalFilteredRows={preGlobalFilteredRows}
            globalFilter={state.globalFilter}
            setGlobalFilter={setGlobalFilter}
            isProductsFilter={isProductsFilter}
            isCustomerFilter={isCustomerFilter}
            customerstatus={customerstatus}
            isOrderFilter={isOrderFilter}
            isContactsFilter={isContactsFilter}
            isCompaniesFilter={isCompaniesFilter}
            isLeadsFilter={isLeadsFilter}
            isCryptoOrdersFilter={isCryptoOrdersFilter}
            isInvoiceListFilter={isInvoiceListFilter}
            isTicketsListFilter={isTicketsListFilter}
            isNFTRankingFilter={isNFTRankingFilter}
            isTaskListFilter={isTaskListFilter}
            SearchPlaceholder={SearchPlaceholder}
            setcustomerStatus={setcustomerStatus}
            customerStatus={customerStatus}
            setSearchValue={setSearchValue}
            searchValue={searchValue}
            iscreated={iscreated}
            addbuttontext={addbuttontext}
            additionalstatus={additionalstatus}
            setAdditionalstatus={setAdditionalstatus}
            AdditionalOption={AdditionalOption}
            isAdditionalStatus={isAdditionalStatus}
            onClickOpenAddModal={onClickOpenAddModal}
          />
        )}

        {isAddOptions && (
          <Col sm="7">
            <div className="text-sm-end">
              <Button
                type="button"
                color="success"
                className="btn-rounded  mb-2 me-2"
                onClick={handleOrderClicks}
              >
                <i className="mdi mdi-plus me-1" />
                Add New Order
              </Button>
            </div>
          </Col>
        )}
        {isAddUserList && (
          <Col sm="7">
            <div className="text-sm-end">
              <Button
                type="button"
                color="primary"
                className="btn mb-2 me-2"
                onClick={handleUserClick}
              >
                <i className="mdi mdi-plus-circle-outline me-1" />
                Create New User
              </Button>
            </div>
          </Col>
        )}
        {isAddCustList && (
          <Col sm="7">
            <div className="text-sm-end">
              <Button
                type="button"
                color="success"
                className="btn-rounded mb-2 me-2"
                onClick={handleCustomerClick}
              >
                <i className="mdi mdi-plus me-1" />
                New Customers
              </Button>
            </div>
          </Col>
        )}
      </Row>

      {page?.length > 0 ? (
        <div className={divClass} style={{ height: "calc(100vh - 300px)" }}>
          <Table hover {...getTableProps()} className={tableClass}>
            <thead className={theadClass}>
              {headerGroups.map((headerGroup) => (
                <tr
                  className={trClass}
                  key={headerGroup.id}
                  {...headerGroup.getHeaderGroupProps()}
                >
                  {headerGroup.headers.map((column) => (
                    <th
                      key={column.id}
                      className={thClass}
                      {...column.getSortByToggleProps()}
                      style={{ width: column.width }}
                    >
                      {column.render("Header")}
                      {generateSortingIndicator(column)}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody {...getTableBodyProps()}>
              {page.map((row) => {
                prepareRow(row);
                return (
                  <Fragment key={row.getRowProps().key}>
                    <tr>
                      {row.cells.map((cell) => {
                        return (
                          <td key={cell.id} {...cell.getCellProps()}>
                            {cell.render("Cell")}
                          </td>
                        );
                      })}
                    </tr>
                  </Fragment>
                );
              })}
            </tbody>
          </Table>
        </div>
      ) : (
        <div className="py-4 text-center">
          <div className="mt-4">
            <h5>Sorry! No Result Found</h5>
          </div>
        </div>
      )}
      {isPagination && (
        <Row className="justify-content-md-between justify-content-center align-items-center p-2">
          <Col className="col-12 col-sm-6">
            <span className="me-3">
              Page <b>{currentPage}</b> of{" "}
              <b>{Math.ceil(totalDataCount / pageSize)}</b>
            </span>
            <span>
              Showing{" "}
              <b>
                {" "}
                {Math.min((currentPage - 1) * pageSize + 1, totalDataCount)}
              </b>{" "}
              to <b>{Math.min(currentPage * pageSize, totalDataCount)}</b> of{" "}
              <b> {totalDataCount}</b> entries
            </span>
          </Col>
          {ispaginationshow && (
            <Col className="col-12 col-sm-6">
              <div className="d-flex  justify-content-end  mt-3 mt-md-0">
                <div>
                  <Button
                    color="primary"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="pagination-btn"
                    disabled={currentPage <= 1}
                  >
                    {"<"}
                  </Button>
                </div>

                <div className="d-flex pagination-numbers">
                  {pageNumbers?.map((page) => {
                    if (page === currentPage) {
                      return (
                        <div key={page} className="current-page active-page">
                          <p style={{ fontSize: "13px" }}>{page}</p>
                        </div>
                      );
                    } else if (
                      page === 1 ||
                      page === nPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <div
                          key={page}
                          className={`current-page ${
                            page === currentPage ? "active-page" : ""
                          }`}
                          onClick={() => {
                            setCurrentPage(page);
                          }}
                        >
                          <p style={{ fontSize: "13px" }}>{page}</p>
                        </div>
                      );
                    } else if (
                      (page === currentPage - 2 && currentPage > 3) ||
                      (page === currentPage + 2 && currentPage < nPages - 2)
                    ) {
                      return (
                        <div key={page} className="current-page">
                          <p>{"..."}</p>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
                <div>
                  <Button
                    color="primary"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="pagination-btn"
                    disabled={nPages === currentPage}
                  >
                    {">"}
                  </Button>
                </div>
              </div>
            </Col>
          )}
        </Row>
      )}
    </Fragment>
  );
};

TableContainer.propTypes = {
  preGlobalFilteredRows: PropTypes.any,
};

export default TableContainer;
