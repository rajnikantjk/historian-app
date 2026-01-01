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
import { UpdateAiSubCategory, getTaglist, getSchedulerList, AddNewGroupDetails, EditGroupDetails, DeleteGroupData, getSlotsList, getReportTypeList, saveSchdule, DeleteScheduleData, getIntervalList, getTagGroupList, getTagsByGroupId } from "../../slices/tools";
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
  document.title = "Scheduler List | AlarmIQ - Historian/ PIMS";

  const dispatch = useDispatch();
  const { schedulerListCount, slotsData, reportListData, toolSubCategoryData, intervalData, schedulerListData, toolLoader, toolCategoryData } = useSelector(
    (state) => state.Tool
  );
  const categoriesData = [
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
  const [modalData, setModalData] = useState({
    isOpen: false,
    title: '',
    content: '',
    isPath: false
  });
  const [errors, setErrors] = useState({});
  const [formErrors, setFormErrors] = useState({});
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
  const groupOptions = toolSubCategoryData?.map(item => ({
    value: item?.id,
    label: item?.grpName,
  }))

  const intervaldata = intervalData?.map((item, i) => {
    return {
      value: item?.value,
      label: item?.key,
    };
  }).filter((data) => data != undefined);

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
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [tagOptions, setTagOptions] = useState([]);
  const [defaulttagOptions, setDefaultTagOptions] = useState([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  console.log("selectedGroup", selectedGroup, schedulerForm)
  const reportTypeOptions = reportListData?.map(item => ({
    value: item,
    label: item
  }))


  const slotOptions = slotsData?.map(item => ({
    value: item.value,
    label: item.key
  }))

  const handleViewClick = (content, title = 'View Details', isPath = false) => {
    setModalData({
      isOpen: true,
      title,
      content,
      isPath
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(modalData.content);
    toast.success('Copied to clipboard!');
  };

  // Load tags for the dropdown
  const loadTags = async (inputValue) => {
    setIsLoadingTags(true);
    try {
      const response = await dispatch(getTaglist({ search: inputValue || '', isActive: "Y", page: 1, limit: 1000 }));

      const options = response.payload?.content?.map(tag => ({
        value: tag.id,
        label: tag.displayTagName,
        ...tag
      })) || [];

      setTagOptions(options);
      if (!inputValue) {
        setDefaultTagOptions(options);
      }
      return options;
    } catch (error) {
      console.error('Error loading tags:', error);
      return [];
    } finally {
      setIsLoadingTags(false);
    }
  };

  // Handle tag selection change
  const handleTagChange = (selectedOptions, actionMeta) => {
    const newSelectedTags = selectedOptions || [];
    setSelectedTags(newSelectedTags);
    setSchedulerForm(prev => ({
      ...prev,
      tagIds: newSelectedTags.map(tag => tag.value).join(','),
      displayTagNames: newSelectedTags.map(tag => tag.label).join(','),
    }));
  };

  const handleGroupChange = (selectedOption) => {
    setSelectedGroup(selectedOption || null);

    if (selectedOption?.value) {
      setIsLoadingTags(true);
      setSchedulerForm(prev => ({
        ...prev,
        grpId: selectedOption.value
      }));

      // Fetch tags for the selected group
      dispatch(getTagsByGroupId(selectedOption.value))
        .then((res) => {
          const options = res?.payload?.map(tag => ({
            value: tag.id,
            label: tag.displayTagName,
            ...tag
          })) || [];

          setTagOptions(options);

          // Filter currently selected tags to only those that exist in the new group
          // Optional: decide if you want to clear tags or keep valid ones
          // For now, let's keep valid ones

          const validSelectedTags = []

          setSelectedTags(validSelectedTags);
          setSchedulerForm(prev => ({
            ...prev,
            tagIds: validSelectedTags.map(tag => tag.value).join(','),
            displayTagNames: validSelectedTags.map(tag => tag.label).join(','),
          }));
        })
        .catch((err) => {
          console.error("Error fetching tags by group ID:", err);
          toast.error("Failed to fetch tags for selected group");
          setTagOptions([]);
        })
        .finally(() => {
          setIsLoadingTags(false);
        });
    } else {
      // Reset to all tags if group is cleared
      setTagOptions(defaulttagOptions);
      setSchedulerForm(prev => ({
        ...prev,
        grpId: ''
      }));
    }
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
  const handleSchedulerSubmit = (e) => {
    e?.preventDefault();

    // Validate all fields
    const errors = {};

    if (!schedulerForm.taskName?.trim()) {
      errors.taskName = 'Task name is required';
    }

    if (!schedulerForm.reportType) {
      errors.reportType = 'Please select a report type';
    }

    if (!schedulerForm.startDate) {
      errors.startDate = 'Start date is required';
    }

    if (!schedulerForm.startTime) {
      errors.startTime = 'Start time is required';
    }

    if ((!schedulerForm.intervalHours && schedulerForm.intervalHours !== 0) ||
      (!schedulerForm.intervalMinutes && schedulerForm.intervalMinutes !== 0)) {
      errors.interval = 'Interval is required';
    }

    if (!schedulerForm.storagePath?.trim()) {
      errors.storagePath = 'Storage path is required';
    }

    if (!schedulerForm.grpId && (!selectedTags || selectedTags.length === 0)) {
      const msg = 'Please select either a Group or Tags';
      errors.tagIds = msg;
      errors.grpId = msg;
    }

    if (schedulerForm.reportType === 'FLOW_TOTALIZER') {
      if (!schedulerForm.slot) {
        errors.slot = 'Slot is required';
      }
    }

    if (schedulerForm.reportType === 'HISTORY_TREND_REPORT') {
      if (!schedulerForm.timeSpan) {
        errors.timeSpan = 'Sampling Interval is required';
      }
    }

    // Update form errors state
    setFormErrors(errors);

    // If there are errors, stop form submission
    if (Object.keys(errors).length > 0) {
      return;
    }



    setLoader(true);
    const { intervalHours, intervalMinutes, toEmail, ...formData } = schedulerForm;
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
      grpId: schedulerForm.grpId,
    };

    // Here you would typically dispatch an action to save the scheduler

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
        toast.success(schedulerForm?.id ? "Schedule updated successfully" : "Schedule added successfully")

      } else {
        toast.error(resp.payload?.data?.message)
        setLoader(false);
      }

    }).catch((err) => {

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

  const handleOnChangeLimit = (value) => {
    setPage(1);
    setLimit(value);
  }
  const nPages = Math.ceil(schedulerListCount / limit);

  const onClickOpenAddModal = () => {
    setAddModal(true);
    setRowId("");
    // Clear selected tags when opening the add new schedule modal
    setSelectedTags([]);
    setSelectedGroup(null);
    setTagOptions(defaulttagOptions); // Reset tags to full list
    setSchedulerForm(() => {
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
        grpId: '' // Reset grpId
      };
    })
  };
  useEffect(() => {
    loadTags()
    dispatch(getSlotsList())
    dispatch(getReportTypeList())
    dispatch(getIntervalList())
    dispatch(getTagGroupList({ page: 1, limit: 1000, isActive: "Y" }))
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





  const onClickDelete = (status) => {

    const data1 = {
      id: status?.id,
      status: "Delete",
    };

    setuserStatus(data1);
    setDeleteModal(true);
  };
  const handleOnEdit = async (item) => {
    try {
      // Create a new object without displayTagNames and tagNames
      const { displayTagNames, tagNames, ...itemWithoutTags } = item;

      // Get the exact tag names from the item
      const savedTagNames = (item?.displayTagNames || '').split(',')
        .map(tag => tag.trim())
        .filter(Boolean);

      // Load all available tags
      const allTags = await loadTags('');

      // Create a map of all tags by their display name for quick lookup
      const tagMap = {};
      allTags.forEach(tag => {
        const key = (tag.displayTagName || tag.label || '').toLowerCase().trim();
        if (key) {
          tagMap[key] = tag;
        }
      });

      // Find the exact matching tag objects
      const selectedTagObjects = [];
      const unmatchedTags = [];

      savedTagNames.forEach(tagName => {
        const normalizedTagName = tagName.toLowerCase().trim();
        if (tagMap[normalizedTagName]) {
          selectedTagObjects.push(tagMap[normalizedTagName]);
        } else {
          unmatchedTags.push(tagName);
        }
      });

      // For any unmatched tags, create placeholder objects
      unmatchedTags.forEach(tagName => {
        selectedTagObjects.push({
          value: tagName,
          label: tagName,
          displayTagName: tagName
        });
      });

      // Set the form state with the item data
      setSchedulerForm({
        ...itemWithoutTags,
        slot: parseInt(item?.slot),
        timeSpan: parseInt(item?.timeSpan),
        intervalHours: item?.intervalTime?.split(":")[0] || '0',
        intervalMinutes: item?.intervalTime?.split(":")[1] || '0',
        startDate: item?.startDate ? moment(item.startDate)._d : moment(),
        tagIds: selectedTagObjects.map(tag => tag.value).join(','),
        displayTagNames: selectedTagObjects.map(tag => tag.label || tag.displayTagName || tag.value).join(',')
      });
      setRowId(item?.id);
      // Set the selected tags for the Select component
      setSelectedTags(selectedTagObjects.map(tag => ({
        value: tag.value,
        label: tag.label || tag.displayTagName || tag.value
      })));

      setSelectedGroup({ value: item?.grpId, label: item?.grpName });

      // Open the modal
      setAddModal(true);
    } catch (error) {
      console.error('Error in handleOnEdit:', error);
      // Fallback to basic tag handling if there's an error
      const tagNamesArray = (item?.displayTagNames || '').split(',')
        .map(tag => tag.trim())
        .filter(Boolean);

      setSelectedTags(tagNamesArray.map(tagName => ({
        value: tagName,
        label: tagName
      })));
      setAddModal(true);
    }
  };
  const columns = useMemo(() => [
    {
      id: 'serialNo',
      Header: <div style={{ whiteSpace: 'nowrap' }}>Sr.No</div>,
      filterable: false,
      Cell: (cellProps) => {
        const rowIndex = cellProps.row.index;
        const currentPage = page;
        const pageSize = limit;
        const serialNumber = (currentPage - 1) * pageSize + rowIndex + 1;
        return serialNumber;
      },
    },
    {
      id: 'taskName',
      Header: <div style={{ whiteSpace: 'nowrap' }}>Task Name</div>,
      accessor: (row) => row?.taskName ?? "-",
      filterable: false,
    },
    {
      id: 'grpName',
      Header: <div style={{ whiteSpace: 'nowrap' }}>Gorup</div>,
      accessor: (row) => row?.grpName ?? "-",
      filterable: false,
    },
    {
      id: 'tagList',
      Header: <div style={{ whiteSpace: 'nowrap' }}>Tag List</div>,
      Cell: ({ row }) => {
        return row.original?.displayTagNames ? (
          <span
            className="text-primary"
            style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
            onClick={() => handleViewClick(row.original?.displayTagNames, 'Tag List', false)}
          >
            View
          </span>
        ) : (
          "-"
        );
      },
      filterable: false,
    },
    {
      id: 'slot',
      Header: <div style={{ whiteSpace: 'nowrap' }}>Slot</div>,
      accessor: (row) => row?.slot ?? "-",
      filterable: false,
    },
    {
      id: 'timeSpan',
      Header: <div style={{ whiteSpace: 'nowrap' }}>Time Span</div>,
      accessor: (row) => row?.timeSpan ?? "-",
      filterable: false,
    },
    {
      id: 'reportType',
      Header: <div style={{ whiteSpace: 'nowrap' }}>Report Type</div>,
      accessor: (row) => row?.reportType ?? "-",
      filterable: false,
    },
    {
      id: 'startDate',
      Header: <div style={{ whiteSpace: 'nowrap' }}>Start Date</div>,
      accessor: (row) => row?.startDate ?? "-",
      filterable: false,
    },
    {
      id: 'startTime',
      Header: <div style={{ whiteSpace: 'nowrap' }}>Start Time</div>,
      accessor: (row) => row?.startTime ?? "-",
      filterable: false,
    },
    {
      id: 'interval',
      Header: <div style={{ whiteSpace: 'nowrap' }}>Interval</div>,
      accessor: (row) => row?.intervalTime ?? "-",
      filterable: false,
    },
    {
      id: 'nextRun',
      Header: <div style={{ whiteSpace: 'nowrap' }}>Next Execution Date</div>,
      accessor: (row) => row?.nextExecutionTime ?? "-",
      filterable: false,
    },
    {
      id: 'isActive',
      Header: <div style={{ whiteSpace: 'nowrap' }}>Active</div>,
      accessor: (row) => row?.isActive == "Y" ? "Yes" : "No" ?? "-",
      filterable: false,
    },
    {
      id: 'path',
      Header: <div style={{ whiteSpace: 'nowrap' }}>Path</div>,
      Cell: ({ row }) => {
        const filePath = row.original?.storagePath;
        return filePath ? (
          <span
            className="text-primary"
            style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
            onClick={() => handleViewClick(filePath, 'Storage Location', true)}
          >
            View
          </span>
        ) : (
          "-"
        );
      },
      filterable: false,
    },
    {
      id: 'description',
      Header: <div style={{ whiteSpace: 'nowrap' }}>Description</div>,
      Cell: ({ row }) => {
        const filePath = row.original?.storagePath;
        return filePath ? (
          <span
            className="text-primary"
            style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
            onClick={() => handleViewClick(row.original?.description, 'Description', false)}
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
      id: 'action',
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
      id: 'emptyAction',
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



  return (
    <>

      <Modal isOpen={addModal} size="lg" id="schedulerModal">
        <ModalHeader
          className="bg-primary text-white"
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
            setFormErrors({});
          }}
          close={
            <button className="btn-close btn-close-white" onClick={() => {
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
              setFormErrors({});
            }} />
          }
        >
          <span className="text-white">{rowId ? "Update Schedule" : "Add New Schedule"}</span>
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleSchedulerSubmit}>
            <div className="row">
              <div className="col-12">
                <div className="card border shadow-none mb-3">
                  <div className="card-header border-bottom" style={{ backgroundColor: '#dadfe7d3' }}>
                    <h6 className="mb-0 text-uppercase fw-semibold">Schedule Config</h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <div>
                          <label className="form-label">Task Name </label>
                          <span className="text-danger">* {formErrors.taskName}</span>
                        </div>
                        <Input
                          type="text"
                          className={`form-control ${formErrors.taskName ? 'is-invalid' : ''}`}
                          placeholder="Enter task name"
                          name="taskName"
                          value={schedulerForm.taskName || ''}
                          onChange={handleSchedulerChange}
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <div>
                          <label className="form-label">Report Type </label>
                          <span className="text-danger text-xs font-normal"> *{formErrors?.reportType}</span>
                        </div>
                        <Select
                          className="react-select"
                          classNamePrefix="select"
                          options={reportTypeOptions}
                          isDisabled={!!rowId}
                          value={reportTypeOptions.find(option => option.value === schedulerForm.reportType) || null}
                          onChange={(selected) => {
                            setSchedulerForm(prev => ({
                              ...prev,
                              reportType: selected?.value || ''
                            }));
                            if (formErrors.reportType) {
                              setFormErrors(prev => ({
                                ...prev,
                                reportType: undefined
                              }));
                            }
                          }}
                          placeholder="Select Report Type"
                        />
                        {formErrors.reportType && <div className="invalid-feedback">{formErrors.reportType}</div>}
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label">Start Date <span className="text-danger">*</span></label>
                        <div>
                          <DatePicker
                            selected={schedulerForm.startDate ? new Date(schedulerForm.startDate) : null}
                            onChange={(date) => {
                              handleDateChange(date);
                              if (formErrors.startDate) {
                                setFormErrors(prev => ({
                                  ...prev,
                                  startDate: undefined
                                }));
                              }
                            }}
                            className={`form-control ${formErrors.startDate ? 'is-invalid' : ''}`}
                            dateFormat="yyyy-MM-dd"
                            minDate={new Date()}
                          />
                        </div>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label">Start Time <span className="text-danger">*</span></label>
                        <div>
                          <DatePicker
                            selected={schedulerForm.startTime ? parseTimeString(schedulerForm.startTime) : null}
                            onChange={(time) => {
                              handleTimeChange(moment(time).format('HH:mm'), 'startTime');
                              if (formErrors.startTime) {
                                setFormErrors(prev => ({
                                  ...prev,
                                  startTime: undefined
                                }));
                              }
                            }}
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={timeIntervals}
                            timeCaption="Time"
                            dateFormat="h:mm aa"
                            className={`form-control ${formErrors.startTime ? 'is-invalid' : ''}`}
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
                        <div>
                          <label className="form-label">Interval </label>
                          <span className="text-danger"> *{formErrors.interval}</span>
                        </div>
                        <div className={`d-flex gap-2 ${formErrors.interval ? 'is-invalid' : ''}`}>
                          <div className="flex-grow-1 position-relative">
                            <Input
                              type="number"
                              min="0"
                              max="9000"
                              value={schedulerForm.intervalHours}
                              onChange={(e) => {
                                const hours = Math.min(9000, Math.max(0, parseInt(e.target.value)));
                                setSchedulerForm(prev => ({
                                  ...prev,
                                  intervalHours: hours
                                }));
                              }}
                              className="form-control pe-5"
                            />
                            <span className="position-absolute end-0 top-50 translate-middle-y me-3 text-muted">Hours</span>
                          </div>
                          <div className="flex-grow-1 position-relative">
                            <Input
                              type="number"
                              min="0"
                              max="59"
                              value={schedulerForm.intervalMinutes}
                              onChange={(e) => {
                                const minutes = Math.min(59, Math.max(0, parseInt(e.target.value)));
                                setSchedulerForm(prev => ({
                                  ...prev,
                                  intervalMinutes: minutes
                                }));
                              }}
                              className="form-control pe-5"
                            />
                            <span className="position-absolute end-0 top-50 translate-middle-y me-3 text-muted">Mins</span>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6 mb-3">
                        <div>
                          <label className="form-label">Storage Path </label>
                          <span className="text-danger"> * {formErrors.storagePath}</span>
                        </div>
                        <div className="input-group">
                          <Input
                            type="text"
                            className={`form-control`}
                            placeholder="Add storage path"
                            name="storagePath"
                            value={schedulerForm.storagePath || ''}
                            onChange={handleSchedulerChange}
                            readOnly={false}
                          />
                        </div>
                      </div>

                      <div className="col-6 mb-3">
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

                      <div className="col-6 mb-3">
                        <label className="form-label d-block">Status</label>
                        <div className="border border-gray-400 rounded py-1 px-2 d-flex align-items-center" style={{ border: `1px solid #ced4da !important` }}>
                          <div className="form-check form-switch form-switch-lg mb-0" dir="ltr">
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
                            <label className="form-check-label ms-2 fw-medium" htmlFor="isActive">
                              {schedulerForm.isActive === "Y" ? "Active" : "Inactive"}
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="card border shadow-none ">
                  <div className="card-header border-bottom" style={{ backgroundColor: '#dadfe7d3' }}>
                    <h6 className="mb-0 text-uppercase fw-semibold">Report Filter</h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-6 mb-3">
                        <div>
                          <label className="form-label">Group </label>
                          <span className="text-danger text-xs font-normal"> {formErrors?.grpId}</span>
                        </div>
                        <Select
                          isClearable
                          cacheOptions
                          defaultOptions
                          options={groupOptions}
                          value={selectedGroup}
                          onChange={handleGroupChange}
                          getOptionValue={option => option.value}
                          getOptionLabel={option => option.label}
                          placeholder="Search and select group..."
                          loadingMessage={() => "Loading group..."}
                          noOptionsMessage={() => "No group found"}
                          isLoading={isLoadingTags}
                          className="react-select"
                          classNamePrefix="select"
                        />
                      </div>

                      <div className="col-12 mb-3">
                        <div>
                          <label className="form-label">Tags </label>
                          <span className="text-danger text-xs font-normal"> {formErrors?.tagIds}</span>
                        </div>
                        <Select
                          isMulti
                          cacheOptions
                          defaultOptions
                          options={tagOptions}
                          value={selectedTags}
                          onChange={handleTagChange}
                          getOptionValue={option => option.value}
                          getOptionLabel={option => option.label}
                          placeholder="Search and select tags..."
                          loadingMessage={() => "Loading tags..."}
                          noOptionsMessage={() => "No tags found"}
                          isLoading={isLoadingTags}
                          className="react-select"
                          classNamePrefix="select"
                          closeMenuOnSelect={false}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Slot {schedulerForm.reportType === 'FLOW_TOTALIZER' && <span className="text-danger">*</span>} {formErrors.slot && <span className="text-danger text-xs font-normal">{formErrors.slot}</span>}</label>
                        <Select
                          className="react-select-container"
                          classNamePrefix="select"
                          options={slotOptions}
                          isClearable
                          value={slotOptions.find(option => option.value === schedulerForm.slot) || null}
                          onChange={(selected) => setSchedulerForm(prev => ({
                            ...prev,
                            slot: selected?.value ?? null
                          }))}
                          placeholder="Select Slot"
                        />
                      </div>
                      {schedulerForm.reportType !== 'FLOW_TOTALIZER' && (
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Sampling Interval {schedulerForm.reportType === 'HISTORY_TREND_REPORT' && <span className="text-danger">*</span>} {formErrors.timeSpan && <span className="text-danger text-xs font-normal">{formErrors.timeSpan}</span>}</label>
                          <Select options={intervaldata} className="history-select" placeholder="Select Interval"
                            value={intervaldata.find(option => option.value === schedulerForm.timeSpan) || null}
                            onChange={(selected) => setSchedulerForm(prev => ({
                              ...prev,
                              timeSpan: selected?.value ?? null
                            }))}
                          />
                        </div>
                      )}


                    </div>
                  </div>
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
              setFormErrors({});
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
      <Modal size={modalData.title === 'Tag List' ? "lg" : "md"} isOpen={modalData.isOpen} toggle={() => setModalData(prev => ({ ...prev, isOpen: false }))}>
        <ModalHeader
          className="bg-primary text-white"
          toggle={() => setModalData(prev => ({ ...prev, isOpen: false }))}
          close={
            <button className="btn-close btn-close-white" onClick={() => setModalData(prev => ({ ...prev, isOpen: false }))} />
          }
        >
          <span className="text-white">{modalData.title}</span>
        </ModalHeader>
        <ModalBody>
          {modalData.isPath ? (
            <div className="d-flex align-items-center gap-2 mb-3">
              <Input
                type="text"
                className="form-control"
                value={modalData.content}
                readOnly
              />
              <Button
                color="primary"
                onClick={copyToClipboard}
              >
                Copy
              </Button>
            </div>
          ) : modalData.title === 'Tag List' ? (
            <div className="d-flex flex-wrap gap-2 p-2">
              {modalData.content?.split(',').map((tag, index) => (
                <span key={index} className="rounded bg-light p-2 text-dark text-base font-medium">
                  {tag.trim()}
                </span>
              )) || 'No tags available'}
            </div>
          ) : (
            <div className="p-2" style={{ whiteSpace: 'pre-line' }}>
              {modalData.content || 'No description available'}
            </div>
          )}
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
                    Schedule Configuration
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
                          SearchPlaceholder="Search Schedule..."
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
                            SearchPlaceholder="Search Schedule..."
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
