import React, { useState, useEffect } from "react";
import {
    Row,
    Col,
    Card,
    CardBody,
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    FormGroup,
    Label,
    Input,
    Form,
    InputGroup,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../../Components/Common/Loader";
import FeatherIcon from "feather-icons-react";
import {
    getIntervalList,
    getReportTypeList,
    getSlotsList,
    getTagGroupList,
    getTaglist,
    downloadHistoryTrendReport,
    downloadFlowTotalizerReport,
    getTagsByGroupId
} from "../../slices/tools";
import { useDispatch, useSelector } from "react-redux";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select';

const Reports = () => {
    document.title = "Reports | AlarmIQ - Historian/ PIMS";
    const [tagOptions, setTagOptions] = useState([]);
    const [defaulttagOptions, setDefaultTagOptions] = useState([]);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isFlowModalOpen, setIsFlowModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState({
        history: null,
        flow: null
    });
    const [filters, setFilters] = useState({
        history: {
            startDateTime: new Date(Date.now() - 30 * 60000), // 30 minutes before current time
            endDateTime: new Date(),
            timeSpan: "",
            group: "",
            tag: [],
            slot: ""
        },
        flow: {
            dateTime: new Date(),
            slot: "",
            group: "",
            tag: []
        }
    });
    const dispatch = useDispatch()
    const { slotsData, intervalData, toolSubCategoryData } = useSelector(
        (state) => state.Tool
    );

    const defaultFilters = {
        history: {
            startDateTime: new Date(Date.now() - 30 * 60000), // 30 minutes before current time
            endDateTime: new Date(),
            timeSpan: "",
            group: "",
            tag: [],
            slot: ""
        },
        flow: {
            dateTime: new Date(),
            slot: "",
            group: "",
            tag: []
        }
    };

    const resetFilters = (reportType) => {
        setFilters(prev => ({
            ...prev,
            [reportType]: { ...defaultFilters[reportType] }
        }));
        // Clear the selected slot
        setSelectedSlot(prev => ({
            ...prev,
            [reportType]: null
        }));
    };

    const toggleHistoryModal = () => {
        if (isHistoryModalOpen) {
            resetFilters('history');
        }
        setIsHistoryModalOpen(!isHistoryModalOpen);
    };

    const toggleFlowModal = () => {
        if (isFlowModalOpen) {
            resetFilters('flow');
        }
        setIsFlowModalOpen(!isFlowModalOpen);
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

    })

    const slotOptions = slotsData?.map(item => ({
        value: item.value,
        label: item.key
    }))
    const handleInputChange = (reportType, field, selectedOption) => {
        if (field === 'slot') {
            // Handle slot selection
            setSelectedSlot(prev => ({
                ...prev,
                [reportType]: selectedOption
            }));

            // Update filters with the slot value
            setFilters(prev => ({
                ...prev,
                [reportType]: {
                    ...prev[reportType],
                    slot: selectedOption?.value || 0
                }
            }));
        } else {
            // Handle other fields
            setFilters(prev => {
                const newValue = Array.isArray(selectedOption)
                    ? selectedOption.map(opt => opt?.value).filter(Boolean)
                    : selectedOption?.value || '';

                const updatedState = {
                    ...prev,
                    [reportType]: {
                        ...prev[reportType],
                        [field]: newValue
                    }
                };

                if (field === "group") {
                    updatedState[reportType].tag = [];
                }

                return updatedState;
            });
        }
    };


    const customStyles = {
        control: (provided) => ({
            ...provided,
            minHeight: '38px',
            height: '38px',
            borderRadius: '0.25rem',
            borderColor: '#ced4da',
            '&:hover': {
                borderColor: '#86b7fe',
                boxShadow: '0 0 0 0.25rem rgba(13, 110, 253, 0.25)'
            },
            '&:focus-within': {
                borderColor: '#86b7fe',
                boxShadow: '0 0 0 0.25rem rgba(13, 110, 253, 0.25)'
            }
        }),
        valueContainer: (provided) => ({
            ...provided,
            height: '36px',
            padding: '0 8px'
        }),
        input: (provided) => ({
            ...provided,
            margin: '0px',
            padding: '0px'
        }),
        indicatorsContainer: (provided) => ({
            ...provided,
            height: '36px'
        })
    };

    const handleSubmit = async (e, reportType) => {
        e.preventDefault();

        // Get current filters for the report type
        const currentFilters = filters[reportType];
        let isValid = true;
        let errorMessage = '';

        // Common validation for both report types
        if (!currentFilters.group && currentFilters.tag?.length == 0) {
            isValid = false;
            errorMessage = 'Please select either a Group or a Tag';
        }

        // Date validation for history report
        if (reportType === 'history') {
            if (currentFilters.startDateTime >= currentFilters.endDateTime) {
                isValid = false;
                errorMessage = 'Start date/time must be before end date/time';
            }
        }

        // Specific validations for history report
        if (reportType === 'history') {
            if (!currentFilters.startDateTime) {
                isValid = false;
                errorMessage = 'Start Date/Time is required';
            } else if (!currentFilters.endDateTime) {
                isValid = false;
                errorMessage = 'End Date/Time is required';
            } else if (!currentFilters.timeSpan) {
                isValid = false;
                errorMessage = 'Sampling Interval is required';
            }
        }
        // Specific validation for flow report
        else if (reportType === 'flow') {
            if (!currentFilters.dateTime) {
                isValid = false;
                errorMessage = 'Date/Time is required';
            }
            if (currentFilters.slot === "") {
                isValid = false;
                errorMessage = 'Slot is required';
            }
        }

        if (!isValid) {
            toast.error(errorMessage);
            return;
        }

        setIsLoading(true);

        try {
            // Prepare the API payload
            let payload = {
                ...currentFilters,
                slot: selectedSlot[reportType]?.value ?? null
            };
            // Helper function to format dates as 'yyyy-MM-dd HH:mm'
            const formatDate = (date, format = 'yyyy-MM-dd HH:mm') => {
                const d = new Date(date);
                const pad = (num) => num.toString().padStart(2, '0');

                const replacements = {
                    'yyyy': d.getFullYear(),
                    'MM': pad(d.getMonth() + 1),
                    'dd': pad(d.getDate()),
                    'HH': pad(d.getHours()),
                    'mm': pad(d.getMinutes()),
                    'ss': pad(d.getSeconds())
                };

                return format.replace(/yyyy|MM|dd|HH|mm|ss/g, match => replacements[match] || match);
            };

            // Convert dates to ISO string for the API
            if (reportType === 'history') {
                const { group, tag, ...rest } = payload
                payload = {
                    ...rest,
                    defaultLoad: null,
                    grpId: group == "" ? null : group,
                    tagId: tag?.map(tags => tags).join(','),
                    startDateTime: formatDate(rest.startDateTime, 'yyyy-MM-dd HH:mm:ss'),
                    endDateTime: formatDate(rest.endDateTime, 'yyyy-MM-dd HH:mm:ss')
                };
            } else if (reportType === 'flow') {
                const { dateTime, group, tag, ...rest } = payload
                payload = {
                    ...rest,
                    grpId: group == "" ? null : group,
                    tagId: tag?.map(tags => tags).join(','),
                    date: formatDate(dateTime, 'yyyy-MM-dd HH:mm')
                };
            }

            // Determine which API to call based on report type
            const apiAction = reportType === 'history'
                ? downloadHistoryTrendReport
                : downloadFlowTotalizerReport;

            // Dispatch the API call
            const result = await dispatch(apiAction(payload)).unwrap();

            // Handle the file download
            if (result && result.fileUrl) {
                // Create a temporary link to trigger the download
                const link = document.createElement('a');
                link.href = result.fileUrl;
                link.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.xlsx`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                toast.success('Report downloaded successfully');
                setIsLoading(false);
                // Close the appropriate modal
                reportType === 'history' ? toggleHistoryModal() : toggleFlowModal();
            } else {
                const fileExtension = reportType === 'history' ? 'zip' : 'xlsx';
                const mimeType = reportType === 'history'
                    ? 'application/zip'
                    : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

                // Handle the case where the API returns the file data directly
                const blob = new Blob([result], { type: mimeType });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${reportType === "flow" ? "flow-totalizer" : reportType}-report.${fileExtension}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                toast.success('Report downloaded successfully');
                setIsLoading(false);
                resetFilters("history")
                resetFilters("flow")
            }
        } catch (error) {
            setIsLoading(false);
            toast.error(error?.data?.message || 'Failed to download report');
        } finally {

        }
    };

    const reportCards = [
        {
            id: "history",
            title: "History Report",
            icon: "clock",
            color: "primary",
            description: "Generate detailed historical data reports with custom date ranges and filters.",
            buttonText: "Download History Report",
            onClick: toggleHistoryModal
        },
        {
            id: "flow",
            title: "Flow Totalizer Report",
            icon: "activity",
            color: "success",
            description: "Create comprehensive flow totalizer reports with various aggregation options.",
            buttonText: "Download Flow Totalizer Report",
            onClick: toggleFlowModal
        }
    ];

    const navigate = useNavigate();
    const userRole = JSON.parse(localStorage.getItem("authUser"))?.role;

    useEffect(() => {
        if (userRole !== "ROLE_ADMIN") {
            toast.error("You are not authorized to access this page");
            navigate("/dashboard");
        }
    }, [userRole, navigate]);

    // Load tags for the dropdown
    const loadTags = async (inputValue) => {

        try {
            const response = await dispatch(getTaglist({ search: inputValue || '', page: 1, limit: 1000 }));
            const options = response.payload?.content?.map(tag => ({
                value: tag.id,
                label: tag.displayTagName,
                ...tag
            })) || [];
            if (!inputValue) {
                setTagOptions(options);
                setDefaultTagOptions(options)
            }
            return options;
        } catch (error) {
            console.error('Error loading tags:', error);
            return [];
        } finally {

        }
    };

    useEffect(() => {
        loadTags()
        dispatch(getSlotsList())
        dispatch(getIntervalList())
        dispatch(getTagGroupList({ page: 1, limit: 1000 }))
    }, [])

    useEffect(() => {
        if (filters?.history?.group || filters?.flow?.group) {
            dispatch(getTagsByGroupId(filters?.history?.group || filters?.flow?.group)).then((res) => {
                const options = res?.payload?.map(tag => ({
                    value: tag.id,
                    label: tag.displayTagName,
                    ...tag
                })) || [];

                setTagOptions(options)
            }).catch((err) => {
                console.error("Error fetching tags by group ID:", err);
                toast.error("Failed to fetch tags for selected group");
            });
        } else {
            setTagOptions(defaulttagOptions)
        }
    }, [filters?.history?.group, filters?.flow?.group]);



    return (
        <div className="page-content">
            <div className="container-fluid">
                <Row className="mb-4">
                    <Col xs={12}>
                        <div className="page-title-box d-flex align-items-center justify-content-between">
                            <h4 className="mb-0">Reports </h4>

                        </div>
                    </Col>
                </Row>

                <Row className="g-4">
                    {reportCards.map((report) => (
                        <Col key={report.id} xl={6} lg={12}>
                            <Card className="h-100 report-card">
                                <CardBody className="d-flex flex-column h-100">
                                    <div className="d-flex align-items-center mb-3">
                                        <div className={`avatar-sm flex-shrink-0`}>
                                            <div className={`avatar-title rounded bg-soft-${report.color} text-${report.color} fs-20`}>
                                                <FeatherIcon icon={report.icon} className="icon-sm" />
                                            </div>
                                        </div>
                                        <h5 className="ms-3 mb-0">{report.title}</h5>
                                    </div>
                                    <p className="text-muted flex-grow-1">{report.description}</p>
                                    <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                                        <div className="text-muted">

                                        </div>
                                        <Button
                                            color={report.color}
                                            className="btn-label"
                                            onClick={report.onClick}
                                        >
                                            <FeatherIcon icon="download" className="icon-md label-icon" />
                                            {report.buttonText}
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    ))}
                </Row>


            </div>

            {/* History Report Modal */}
            <Modal isOpen={isHistoryModalOpen} toggle={toggleHistoryModal} size="lg" backdrop="static" keyboard={false}>
                <ModalHeader
                    className="bg-primary text-white"
                    toggle={toggleHistoryModal}
                    close={
                        <button className="btn-close btn-close-white" onClick={toggleHistoryModal} />
                    }
                >
                    <span className="text-white">History Report</span>
                </ModalHeader>
                <Form onSubmit={(e) => handleSubmit(e, 'history')}>
                    <ModalBody>
                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <Label>Start Date & Time<span className="text-danger">*</span></Label>
                                    <DatePicker
                                        selected={filters.history.startDateTime}
                                        onChange={(date) => setFilters(prev => ({
                                            ...prev,
                                            history: {
                                                ...prev.history,
                                                startDateTime: date
                                            }
                                        }))}
                                        showTimeSelect
                                        timeFormat="HH:mm"
                                        timeIntervals={15}
                                        timeCaption="Time"
                                        dateFormat="MMMM d, yyyy h:mm aa"
                                        className="form-control"
                                        maxDate={new Date()}
                                        required
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>
                                    <Label>End Date & Time<span className="text-danger">*</span></Label>
                                    <DatePicker
                                        selected={filters.history.endDateTime}
                                        onChange={(date) => setFilters(prev => ({
                                            ...prev,
                                            history: {
                                                ...prev.history,
                                                endDateTime: date
                                            }
                                        }))}
                                        showTimeSelect
                                        timeFormat="HH:mm"
                                        timeIntervals={15}
                                        timeCaption="Time"
                                        dateFormat="MMMM d, yyyy h:mm aa"
                                        className="form-control"
                                        maxDate={new Date()}
                                        minDate={filters.history.startDateTime}
                                        required
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <Label>Group</Label>
                                    <Select
                                        className="react-select-container"
                                        classNamePrefix="select"
                                        value={groupOptions?.find(opt => opt.value === filters.history.group) || null}
                                        onChange={(selected) => handleInputChange('history', 'group', selected)}
                                        options={groupOptions}
                                        placeholder="Select Group"
                                        styles={customStyles}
                                        isClearable

                                    />
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>
                                    <Label>Tag</Label>
                                    <Select
                                        className="react-select-container"
                                        classNamePrefix="select"
                                        value={Array.isArray(filters.history.tag)
                                            ? filters.history.tag.map(tagId => tagOptions?.find(opt => opt.value === tagId))
                                            : []}
                                        onChange={(selected) => handleInputChange('history', 'tag', selected || [])}
                                        options={tagOptions}
                                        placeholder="Select Tags"
                                        styles={customStyles}
                                        isMulti
                                        isClearable
                                        closeMenuOnSelect={false}
                                        hideSelectedOptions={false}
                                    />
                                </FormGroup>
                            </Col>


                        </Row>
                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <Label>Sampling Interval<span className="text-danger">*</span></Label>
                                    <Select
                                        className="react-select-container"
                                        classNamePrefix="select"
                                        value={intervaldata?.find(opt => opt.value === filters.history.timeSpan) || null}
                                        onChange={(selected) => handleInputChange('history', 'timeSpan', selected)}
                                        options={intervaldata}
                                        placeholder="Select Sampling Interval"
                                        styles={customStyles}
                                        isClearable
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>
                                    <Label>Slot</Label>
                                    <Select
                                        className="react-select-container"
                                        classNamePrefix="select"
                                        value={selectedSlot.history}
                                        onChange={(selected) => handleInputChange('history', 'slot', selected)}
                                        options={slotOptions}
                                        placeholder="Select Slot"
                                        styles={customStyles}
                                        isClearable
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                    </ModalBody>
                    <div className="modal-footer">
                        <Button type="button" color="light" onClick={() => {
                            resetFilters('history');
                            toggleHistoryModal();
                        }}>
                            Cancel
                        </Button>{' '}
                        <Button type="submit" color="primary" disabled={isLoading}>
                            <i className="ri-download-line me-1"></i> Download Report
                        </Button>
                    </div>
                </Form>
            </Modal>
            <Modal isOpen={isFlowModalOpen} toggle={toggleFlowModal} size="lg" backdrop="static" keyboard={false}>
                <ModalHeader
                    className="bg-primary text-white"
                    toggle={toggleFlowModal}
                    close={
                        <button className="btn-close btn-close-white" onClick={toggleFlowModal} />
                    }
                >
                    <span className="text-white"> Flow Totalizer Report</span>
                </ModalHeader>
                <Form onSubmit={(e) => handleSubmit(e, 'flow')}>
                    <ModalBody>
                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <Label>Date & Time<span className="text-danger">*</span></Label>
                                    <DatePicker
                                        selected={filters.flow.dateTime}
                                        onChange={(date) => setFilters(prev => ({
                                            ...prev,
                                            flow: {
                                                ...prev.flow,
                                                dateTime: date
                                            }
                                        }))}
                                        showTimeSelect
                                        timeFormat="HH:mm"
                                        timeIntervals={15}
                                        timeCaption="Time"
                                        dateFormat="MMMM d, yyyy h:mm aa"
                                        className="form-control"
                                        required
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>
                                    <Label>Slot<span className="text-danger">*</span></Label>
                                    <Select
                                        className="react-select-container"
                                        classNamePrefix="select"
                                        value={selectedSlot.flow}
                                        onChange={(selected) => handleInputChange('flow', 'slot', selected)}
                                        options={slotOptions}
                                        placeholder="Select Slot"
                                        styles={customStyles}
                                        isClearable
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <Label>Group</Label>
                                    <Select
                                        className="react-select-container"
                                        classNamePrefix="select"
                                        value={groupOptions?.find(opt => opt.value === filters.flow.group) || null}
                                        onChange={(selected) => handleInputChange('flow', 'group', selected)}
                                        options={groupOptions}
                                        placeholder="Select Group"
                                        styles={customStyles}
                                        isClearable

                                    />
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>
                                    <Label>Tag</Label>
                                    <Select
                                        className="react-select-container"
                                        classNamePrefix="select"
                                        value={Array.isArray(filters.flow.tag)
                                            ? filters.flow.tag.map(tagId => tagOptions?.find(opt => opt.value === tagId))
                                            : []}
                                        onChange={(selected) => handleInputChange('flow', 'tag', selected || [])}
                                        options={tagOptions}
                                        placeholder="Select Tags"
                                        styles={customStyles}
                                        isMulti
                                        isClearable
                                        closeMenuOnSelect={false}
                                        hideSelectedOptions={false}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                    </ModalBody>
                    <div className="modal-footer">
                        <Button type="button" color="light" onClick={() => {
                            resetFilters('flow');
                            toggleFlowModal();
                        }}>
                            Cancel
                        </Button>{' '}
                        <Button type="submit" color="success" disabled={isLoading}>
                            <i className="ri-download-line me-1"></i> Download Report
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default Reports;