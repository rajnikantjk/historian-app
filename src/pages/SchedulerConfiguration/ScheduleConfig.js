import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DeleteUser } from "../../slices/user";
import TableContainer from "../../Components/Common/TableContainer";
import { useMemo } from "react";
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
import { Copy, Folder } from "react-feather";
import moment from "moment";
import Loader from "../../Components/Common/Loader";
import { ToastContainer, toast } from "react-toastify";
import DeleteModal from "../../Components/Common/DeleteModal";
import { UpdateAiSubCategory, getTaglist, getSchedulerList, AddNewGroupDetails, EditGroupDetails, DeleteGroupData, getSlotsList, getReportTypeList, saveSchdule, DeleteScheduleData } from "../../slices/tools";
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


const customerstatus = [
  { label: "All", value: "" },
  { label: "Active", value: "active" },
  { label: "Deactivate", value: "inactive" },
];
const ScheduleConfig = () => {
  document.title = "Scheduler List | Augmation Tech";

  const dispatch = useDispatch();
  const { schedulerListCount, slotsData, reportListData, schedulerListData, toolLoader, toolCategoryData } = useSelector(
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
  const [modal, setModal] = useState(false);
  const [selectedPath, setSelectedPath] = useState("");
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState({});
  const userRole = JSON.parse(localStorage.getItem("authUser"))?.role;

  const getNext15MinuteSlot = () => {
    const now = new Date();
    const minutes = now.getMinutes();
    const nextSlotMinutes = Math.ceil(minutes / 15) * 15;
    
    // If we're at the top of the hour, add an hour and reset minutes
    if (nextSlotMinutes === 60) {
      now.setHours(now.getHours() + 1);
      now.setMinutes(0, 0, 0);
    } else {
      now.setMinutes(nextSlotMinutes, 0, 0);
    }
    
    return now;
  };

  const formatTimes = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Scheduler form state
  const [schedulerForm, setSchedulerForm] = useState(() => {
    const nextSlot = getNext15MinuteSlot();
    return {
      id: null,
      taskName: '',
      reportType: '',
      startDate: new Date(),
      startTime: formatTimes(nextSlot),
      intervalHours: null,
      intervalMinutes: null,
      storagePath: '',
      slot: null,
      isActive: 'Y',
      description: '',
      tagIds: [],
    };
  });

  const [selectedTags, setSelectedTags] = useState([]);
  const [tagOptions, setTagOptions] = useState([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);

  const reportTypeOptions = reportListData?.map(item => ({
    value: item,
    label: item
  }))


  const slotOptions = slotsData?.map(item => ({
    value: item.value,
    label: item.key
  }))

  const toggleModal = () => setModal(!modal);

  const handleViewClick = (path) => {
    setSelectedPath(path);
    setCopied(false);
    toggleModal();
  };

  const copyToClipboard = () => {
    if (selectedPath) {
      navigator.clipboard.writeText(selectedPath);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Load tags for the dropdown
  const loadTags = async (inputValue) => {
    setIsLoadingTags(true);
    try {
      const response = await dispatch(getTaglist({ search: inputValue || '', page: 1, limit: 1000 }));

      const options = response.payload?.content?.map(tag => ({
        value: tag.id,
        label: tag.displayTagName,
        ...tag
      })) || [];
      console.log("response", options)
      setTagOptions(options);
      return options;
    } catch (error) {
      console.error('Error loading tags:', error);
      return [];
    } finally {
      setIsLoadingTags(false);
    }
  };

  // Handle tag selection change
  const handleTagChange = (selectedOptions) => {
    setSelectedTags(selectedOptions || []);
    setSchedulerForm(prev => ({
      ...prev,
      tagIds: selectedOptions?.map(tag => tag.value).join(','),
    }));
  };

  // Handle input change for the form
  // Update the handleSchedulerChange function to include backslash conversion
  const handleSchedulerChange = (e) => {
    const { name, value, type, checked } = e.target;
    let processedValue = value;

    // Convert backslashes to forward slashes for storagePath
    if (name === 'storagePath') {
      processedValue = value.replace(/\\/g, '/');
    }

    setSchedulerForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 'Y' : 'N') : processedValue
    }));
  };

  // Handle date change
  const handleDateChange = (date) => {
    setSchedulerForm(prev => ({
      ...prev,
      startDate: date
    }));
  };

  // Handle time change
  const handleTimeChange = (time, field) => {
    setSchedulerForm(prev => ({
      ...prev,
      [field]: time
    }));
  };

  // Filter time to show only 15-minute intervals and future times if today
  const filterPassedTime = (time) => {
    const currentDate = new Date();
    const selectedDate = new Date(schedulerForm.startDate);

    // If selected date is today, only show future times
    if (
      selectedDate.getDate() === currentDate.getDate() &&
      selectedDate.getMonth() === currentDate.getMonth() &&
      selectedDate.getFullYear() === currentDate.getFullYear()
    ) {
      return time >= currentDate;
    }

    // For other days, all times are valid
    return true;
  };

  // Time intervals for the time picker (15 minutes)
  const timeIntervals = 15;

  // Format time for display
  const formatTime = (date) => {
    if (!date) return '';
    return moment(date).format('HH:mm');
  };

  // Convert time string to date object
  const parseTimeString = (timeStr) => {
    if (!timeStr) return new Date();
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };
  console.log("schedulerForm", schedulerForm)
  // Handle folder selection
  const handleFolderSelect = async () => {
    try {
      const dirHandle = await window.showDirectoryPicker();
      if (dirHandle) {
        // Request permission to read the directory
        const permission = await dirHandle.requestPermission({ mode: 'read' });
        if (permission === 'granted') {
          // Get the directory path (note: this might be limited by browser security)
          const path = await dirHandle.resolve();
          const fullPath = path ? path.join('/') : dirHandle.name;

          setSchedulerForm(prev => ({
            ...prev,
            storagePath: fullPath
          }));
        }
      }
    } catch (error) {
      console.error('Error selecting directory:', error);
      // Fallback to the previous method
      const input = document.createElement('input');
      input.type = 'file';
      input.webkitdirectory = true;
      input.onchange = (e) => {
        if (e.target.files.length > 0) {
          const filePath = e.target.files[0].webkitRelativePath;
          const directoryPath = filePath.substring(0, filePath.lastIndexOf('/'));
          setSchedulerForm(prev => ({
            ...prev,
            storagePath: directoryPath
          }));
        }
      };
      input.click();
    }
  };

  // Handle form submission
  const handleSchedulerSubmit = () => {
    // Validate form
    if (schedulerForm.taskName.trim() === '') {
      setErrors(prev => ({ ...prev, taskName: 'Task name is required' }));
      return;
    }
    if (schedulerForm.reportType === '') {
      setErrors(prev => ({ ...prev, reportType: 'Please select a report type' }));
      return;
    }
    if (schedulerForm.storagePath.trim() === '') {
      setErrors(prev => ({ ...prev, storagePath: 'Storage path is required' }));
      return;
    }
    
 

    setLoader(true);
    const { intervalHours, intervalMinutes,toEmail, ...formData } = schedulerForm;
    const payload = {
      ...formData,
      intervalTime: `${String(intervalHours).padStart(2, '0')}:${String(intervalMinutes).padStart(2, '0')}`,
      startDate: moment(schedulerForm.startDate).format('YYYY-MM-DD'),
      startTime: schedulerForm.startTime.includes(':') ? 
        (schedulerForm.startTime.split(':').length === 2 ? 
          `${schedulerForm.startTime}:00` : 
          schedulerForm.startTime) : 
        '00:00:00',
      tagIds: selectedTags.map(tag => tag.value).join(','),
    };

    // Here you would typically dispatch an action to save the scheduler
    console.log('Scheduler payload:', selectedTags, payload);
    dispatch(saveSchdule(payload)).then((resp) => {

      if (resp.payload?.status === "success") {
        setAddModal(false)
        setSchedulerForm({
          id: null,
          taskName: '',
          reportType: '',
          startDate: new Date(),
          startTime: '00:00',
          intervalHours: null,
          intervalMinutes: null,
          storagePath: '',
          slot: null,
          isActive: 'Y',
          description: '',
          tagIds: [],

        })
            setLoader(false);
        dispatch(getSchedulerList())
        toast.success(schedulerForm?.id ? "Schedule Task updated successfully" : "Schedule Task added successfully")

      } else {
        toast.error(resp.payload?.data?.message)
            setLoader(false);
      }

    }).catch((err) => {
      console.log("err", err)
          setLoader(false);
      toast.error("Something went wrong")
    })
  };

  const handleOnChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues({
      ...values,
      [name]: type === 'checkbox' ? (checked ? 'Y' : 'N') : value
    });
    setErrors({ ...errors, [name]: "" });
  };
  console.log("schedulerListData", schedulerListData)
  const handleOnChangeLimit = (value) => {
    setPage(1);
    setLimit(value);
  }
  const nPages = Math.ceil(schedulerListCount / limit);

  const onClickOpenAddModal = () => {
    setAddModal(true);
    setRowId("");
    setSchedulerForm(()=>{
    const nextSlot = getNext15MinuteSlot();
    return {
      id: null,
      taskName: '',
      reportType: '',
      startDate: new Date(),
      startTime: formatTimes(nextSlot),
      intervalHours: null,
      intervalMinutes: null,
      storagePath: '',
      slot: null,
      isActive: 'Y',
      description: '',
      tagIds: [],
    };
  })
  };
  useEffect(() => {
    loadTags()
    dispatch(getSlotsList())
    dispatch(getReportTypeList())
  }, [])

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
          getSchedulerList({
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
        getSchedulerList({
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
            dispatch(getSchedulerList());
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
    // Create a new object without displayTagNames and tagNames
    const { displayTagNames, tagNames, ...itemWithoutTags } = item;

    setRowId(item?.id);
    setSchedulerForm({ ...itemWithoutTags,intervalHours: item?.intervalTime?.split(":")[0],
      intervalMinutes: item?.intervalTime?.split(":")[1], startDate: moment(item?.startDate)._d, tagIds: item?.displayTagNames?.split(",").map(tagId => tagOptions.find(option => option.displayTagName === tagId)?.label) });
    setSelectedTags(item?.displayTagNames?.split(",").map(tagId => ({
      value: tagOptions.find(option => option.displayTagName === tagId)?.value,
      label: tagOptions.find(option => option.displayTagName === tagId)?.label || tagId
    })));
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
      Header: "Task Name",
      accessor: (row) => row?.taskName ?? "-",

      filterable: false,
    },
    {
      Header: "Tag List",
      accessor: (row) => row?.displayTagNames ?? "-",

      filterable: false,
    },
    {
      Header: "Report Type",
      accessor: (row) => row?.reportType ?? "-",

      filterable: false,
    },
    {
      Header: "Start Date",
      accessor: (row) => row?.startDate ?? "-",

      filterable: false,
    },
    {
      Header: "Start Time",
      accessor: (row) => row?.startTime ?? "-",

      filterable: false,
    },
    {
      Header: "Interval",
      accessor: (row) => row?.intervalTime ?? "-",

      filterable: false,
    },
    {
      Header: "Slot",
      accessor: (row) => row?.slot ?? "-",

      filterable: false,
    },
    {
      Header: "Active",
      accessor: (row) => row?.isActive == "Y" ? "Yes" : "No" ?? "-",

      filterable: false,
    },
    {
      Header: "Path",
      Cell: ({ row }) => {
        const filePath = row.original?.storagePath;

        return filePath ? (
          <span
            className="text-primary"
            style={{ cursor: 'pointer' }}
            onClick={() => handleViewClick(filePath)}
          >
            View
          </span>
        ) : (
          "-"
        );
      },
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
              {cellProps?.row?.original?.isActive == "Y" && <DropdownItem
                href="#"
                onClick={() => {
                  onClickDelete(cellProps?.row?.original);
                }}
              >
                <i className={`align-bottom me-2 ${cellProps?.row?.original?.isActive === 'N' ? 'ri-checkbox-circle-fill text-success' : 'ri-close-circle-fill text-danger'}`}></i> {" "}
                {cellProps?.row?.original?.isActive == "Y" ? "Deactive" : "Active"}
              </DropdownItem>}
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
      DeleteScheduleData({ id: userStatus.id })
    )
      .then((res) => {
        if (res?.payload?.status == 'success') {

          toast.success("Schedule Deactive Successfully");

          setDeleteModal(false);
          setLoader(false)

          dispatch(
            getSchedulerList()
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
            dispatch(getSchedulerList());
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


  console.log("tagOptions", schedulerForm)
  return (
    <>

      <Modal isOpen={addModal} size="lg" id="schedulerModal">
        <ModalHeader
          toggle={() => {
            setAddModal(false);
            setSchedulerForm({
              id: null,
              taskName: '',
              reportType: '',
              startDate: new Date(),
              startTime: '00:00',
              intervalTime: '01:00',
              storagePath: '',
              slot: null,
              isActive: 'Y',
              description: '',
              tagIds: [],

            });
            setSelectedTags([]);
            setErrors({});
          }}
        >
          {rowId ? "Update Schedule Task" : "Add New Schedule Task"}
        </ModalHeader>
        <ModalBody>
          <form>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Task Name</label>
                <Input
                  type="text"
                  className="form-control"
                  placeholder="Enter task name"
                  name="taskName"
                  value={schedulerForm.taskName}
                  onChange={handleSchedulerChange}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Report Type</label>
                <Select
                  className="react-select"
                  classNamePrefix="select"
                  options={reportTypeOptions}
                  value={reportTypeOptions.find(option => option.value === schedulerForm.reportType) || null}
                  onChange={(selected) => setSchedulerForm(prev => ({
                    ...prev,
                    reportType: selected?.value || ''
                  }))}
                  placeholder="Select Report Type"
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Start Date</label>
                <div>
                  <DatePicker
                    selected={new Date(schedulerForm.startDate)}
                    onChange={handleDateChange}
                    className="form-control"
                    dateFormat="yyyy-MM-dd"
                    minDate={new Date()}
                  />
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Start Time</label>
                <div>
                  <DatePicker
                    selected={schedulerForm.startTime ? parseTimeString(schedulerForm.startTime) : null}
                    onChange={(time) => handleTimeChange(moment(time).format('HH:mm'), 'startTime')}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={timeIntervals}
                    timeCaption="Time"
                    dateFormat="h:mm aa"
                    className="form-control"
                    filterTime={filterPassedTime}
                    minTime={schedulerForm.startDate &&
                      schedulerForm.startDate.getDate() === new Date().getDate() &&
                      schedulerForm.startDate.getMonth() === new Date().getMonth() &&
                      schedulerForm.startDate.getFullYear() === new Date().getFullYear()
                      ? new Date()
                      : new Date().setHours(0, 0, 0, 0)
                    }
                    maxTime={new Date().setHours(23, 59, 59, 999)}
                    placeholderText="Select start time"
                  />
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Interval</label>
                <div className="d-flex gap-2">
                  <div className="flex-grow-1 position-relative">
                    <Input
                      type="number"
                      min="0"
                      max="9000"
                      value={schedulerForm.intervalHours}
                      onChange={(e) => {
                        const hours = Math.min(9000, Math.max(0, parseInt(e.target.value) ));
                        setSchedulerForm(prev => ({
                          ...prev,
                          intervalHours: hours
                        }));
                      }}
                      className="form-control pe-5"
                    />
                    <span className="position-absolute end-0 top-50 translate-middle-y me-3 text-muted">
                      Hours
                    </span>
                  </div>
                  <div className="flex-grow-1 position-relative">
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      value={schedulerForm.intervalMinutes}
                      onChange={(e) => {
                        const minutes = Math.min(59, Math.max(0, parseInt(e.target.value) ));
                        setSchedulerForm(prev => ({
                          ...prev,
                          intervalMinutes: minutes
                        }));
                      }}
                      className="form-control pe-5"
                    />
                    <span className="position-absolute end-0 top-50 translate-middle-y me-3 text-muted">
                      Mins
                    </span>
                  </div>
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Slot</label>
                <Select
                  className="react-select"
                  classNamePrefix="select"
                  options={slotOptions}
                  value={slotOptions.find(option => option.value == schedulerForm.slot) || null}
                  onChange={(selected) => setSchedulerForm(prev => ({
                    ...prev,
                    slot: selected?.value || '0'
                  }))}
                  placeholder="Select Slot"
                />
              </div>

              <div className="col-12 mb-3">
                <label className="form-label">Storage Path</label>
                <div className="input-group">
                  <Input
                    type="text"
                    className="form-control"
                    placeholder="Add storage path"
                    name="storagePath"
                    value={schedulerForm.storagePath}
                    onChange={handleSchedulerChange}
                    readOnly={false} // Ensure it's not read-only
                  />
                  {/* <Button 
                        color="primary" 
                        onClick={handleFolderSelect}
                        type="button"
                      >
                        <Folder size={16} className="me-1" /> Browse
                      </Button> */}
                </div>
              </div>

              <div className="col-12 mb-3">
                <label className="form-label">Tags</label>
                <Select
                  isMulti
                  cacheOptions
                  defaultOptions
                  options={tagOptions}
                  value={selectedTags}
                  onChange={handleTagChange}
                  placeholder="Search and select tags..."
                  loadingMessage={() => "Loading tags..."}
                  noOptionsMessage={() => "No tags found"}
                  isLoading={isLoadingTags}
                  className="react-select"
                  classNamePrefix="select"
                />
              </div>

              <div className="col-12 mb-3">
                <label className="form-label">Description</label>
                <Input
                  type="text"
                  className="form-control"
                  placeholder="Enter description"
                  name="description"
                  value={schedulerForm.description}
                  onChange={handleSchedulerChange}
                />
              </div>

              <div className="col-12 mb-3">
                <div className="form-check">
                  <label className="form-check-label" htmlFor="isActive">
                    Active
                  </label>
                  <Input
                    type="checkbox"
                    className="form-check-input"
                    id="isActive"
                    name="isActive"
                    checked={schedulerForm.isActive === "Y"}
                    onChange={(e) => setSchedulerForm(prev => ({
                      ...prev,
                      isActive: e.target.checked ? 'Y' : 'N'
                    }))}
                  />

                </div>
              </div>
            </div>
          </form>
        </ModalBody>
        <div className="modal-footer">
          <Button
            color="light"
            onClick={() => {
              setAddModal(false);
              setSchedulerForm({
                id: null,
                taskName: '',
                reportType: '',
                startDate: new Date(),
                startTime: '00:00',
                intervalTime: '01:00',
                storagePath: '',
                slot: null,
                isActive: 'Y',
                description: '',
                tagIds: [],

              });
              setSelectedTags([]);
              setErrors({});
            }}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={handleSchedulerSubmit}
            disabled={loader}
          >
            {loader ? (
              <Spinner size="sm" className="me-1">Loading...</Spinner>
            ) : (
              <>{rowId ? "Update" : "Save"}</>
            )}
          </Button>
        </div>
      </Modal>
      <Modal isOpen={modal} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>Storage Location</ModalHeader>
        <ModalBody>
          <div className="d-flex align-items-center gap-2 mb-3">
            <Input
              type="text"
              value={selectedPath}
              readOnly
              className="form-control"
            />
            <Button color="primary" onClick={copyToClipboard} className="d-flex align-items-center">
              <Copy size={16} className="me-1" />
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </Button>
          </div>
          <div className="text-muted small">
            Click the button to copy the path to your clipboard
          </div>
        </ModalBody>
      </Modal>
      <div className="page-content">
        <DeleteModal
          show={deleteModal}
          text={"Deactive"}
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
                    Schedule Task List
                  </h5>
                  {/* {   schedulerListCount > 10 &&  <div className="flex-shrink-0">
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
                      {schedulerListData &&
                        schedulerListData?.length > 0 ? (
                        <TableContainer
                          columns={columns || []}
                          data={schedulerListData || []}
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
                          SearchPlaceholder="Search Schedule Task..."
                          setSearchValue={setSearchValue}
                          searchValue={searchValue}
                          nPages={nPages}
                          currentPage={page}
                          setCurrentPage={setPage}
                          isPagination={
                            (schedulerListCount > 100) ? true : false
                          }

                          iscreated={userRole == "ROLE_ADMIN"}
                          addbuttontext={"Add New Schedule"}
                          onClickOpenAddModal={onClickOpenAddModal}
                          // isAdditionalStatus={true}
                          additionalstatus={additionalstatus}
                          setAdditionalstatus={setAdditionalstatus}
                          AdditionalOption={categoriesData}
                          totalDataCount={schedulerListCount}
                          ispaginationshow={schedulerListCount > 100 && limit < schedulerListCount ? true : false}

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
                            SearchPlaceholder="Search Schedule Task..."
                            setSearchValue={setSearchValue}
                            searchValue={searchValue}
                            isPagination={false}
                            iscreated={userRole == "ROLE_ADMIN"}
                            addbuttontext={"Add New Schedule"}
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

export default ScheduleConfig;
