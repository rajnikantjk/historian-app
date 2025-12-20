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
import { getIntervalList, getReportTypeList, getSlotsList, getTagGroupList, getTaglist } from "../../slices/tools";
import { useDispatch, useSelector } from "react-redux";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select';

const Reports = () => {
    const [tagOptions, setTagOptions] = useState([]);
    
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isFlowModalOpen, setIsFlowModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [filters, setFilters] = useState({
        history: {
            startDateTime: new Date(),
            endDateTime: new Date(),
            timeSpan: "",
            group: "",
            tag: "",
            slot: ""
        },
        flow: {
            dateTime: new Date(),
            slot: "",
            group: "",
            tag: ""
        }
    });
    const dispatch = useDispatch()
    const { slotsData, intervalData ,toolSubCategoryData} = useSelector(
        (state) => state.Tool
    );

    const defaultFilters = {
        history: {
            startDateTime: new Date(),
            endDateTime: new Date(),
            timeSpan: "",
            group: "",
            tag: "",
            slot: ""
        },
        flow: {
            dateTime: new Date(),
            slot: "",
            group: "",
            tag: ""
        }
    };

    const resetFilters = (reportType) => {
        setFilters(prev => ({
            ...prev,
            [reportType]: { ...defaultFilters[reportType] }
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
        setFilters(prev => {
            const newValue = Array.isArray(selectedOption) 
                ? selectedOption.map(opt => opt?.value).filter(Boolean)
                : selectedOption?.value || '';
                
            return {
                ...prev,
                [reportType]: {
                    ...prev[reportType],
                    [field]: newValue
                }
            };
        });
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

    const handleSubmit = (e, reportType) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            console.log(`Downloading ${reportType} report with filters:`, filters[reportType]);
            toast.success("Report is being prepared for download");
            setIsLoading(false);
            // Close the appropriate modal
            reportType === 'history' ? toggleHistoryModal() : toggleFlowModal();
        }, 1500);
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
        dispatch(getTagGroupList({page:1,limit:1000}))
    }, [])

  

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
                                            <FeatherIcon icon="clock" className="icon-xs me-1" />
                                            Last generated: 2 hours ago
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
            <Modal isOpen={isHistoryModalOpen} toggle={toggleHistoryModal} size="lg">
                <ModalHeader toggle={toggleHistoryModal}>
                    <i className="ri-file-chart-line me-2"></i> Configure History Report
                </ModalHeader>
                <Form onSubmit={(e) => handleSubmit(e, 'history')}>
                    <ModalBody>
                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <Label>Start Date & Time</Label>
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
                                        required
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>
                                    <Label>End Date & Time</Label>
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
                                        required
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <Label>Time Span</Label>
                                    <Select
                                        className="react-select-container"
                                        classNamePrefix="select"
                                        value={intervaldata?.find(opt => opt.value === filters.history.timeSpan) || null}
                                        onChange={(selected) => handleInputChange('history', 'timeSpan', selected)}
                                        options={intervaldata}
                                        placeholder="Select Time Span"
                                        styles={customStyles}
                                        isClearable
                                    />
                                </FormGroup>
                            </Col>
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
                        </Row>
                        <Row>
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
                            <Col md={6}>
                                <FormGroup>
                                    <Label>Slot</Label>
                                    <Select
                                        className="react-select-container"
                                        classNamePrefix="select"
                                        value={slotOptions?.find(opt => opt.value === filters.history.slot) || null}
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
                        <Button type="submit" color="primary">
                            <i className="ri-download-line me-1"></i> Download Report
                        </Button>
                    </div>
                </Form>
            </Modal>
            <Modal isOpen={isFlowModalOpen} toggle={toggleFlowModal} size="lg">
                <ModalHeader toggle={toggleFlowModal}>
                    <i className="ri-pie-chart-2-line me-2"></i> Configure Flow Totalizer Report
                </ModalHeader>
                <Form onSubmit={(e) => handleSubmit(e, 'flow')}>
                    <ModalBody>
                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <Label>Date & Time</Label>
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
                                    <Label>Slot</Label>
                                    <Select
                                        className="react-select-container"
                                        classNamePrefix="select"
                                        value={slotOptions?.find(opt => opt.value === filters.flow.slot) || null}
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
                        <Button type="submit" color="success">
                            <i className="ri-download-line me-1"></i> Download Report
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default Reports;