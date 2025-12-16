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
    InputGroupText
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../../Components/Common/Loader";
import FeatherIcon from "feather-icons-react";

const Reports = () => {
   
      const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isFlowModalOpen, setIsFlowModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
   const [filters, setFilters] = useState({
        history: {
            startDateTime: "",
            endDateTime: "",
            timeSpan: "",
            group: "",
            tag: "",
            slot: ""
        },
        flow: {
            dateTime: "",
            slot: "",
            group: "",
            tag: ""
        }
    });

     const toggleHistoryModal = () => setIsHistoryModalOpen(!isHistoryModalOpen);
    const toggleFlowModal = () => setIsFlowModalOpen(!isFlowModalOpen);

 
    const handleInputChange = (reportType, field, value) => {
        setFilters(prev => ({
            ...prev,
            [reportType]: {
                ...prev[reportType],
                [field]: value
            }
        }));
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

    const renderFormFields = () => (
        <>
            <Row className="g-3">
                <Col md={6}>
                    <FormGroup>
                        <Label>Start Date & Time</Label>
                        <Input 
                            type="datetime-local" 
                            required
                            value={filters.startDateTime}
                            onChange={(e) => handleInputChange('startDateTime', e.target.value)}
                        />
                    </FormGroup>
                </Col>
                <Col md={6}>
                    <FormGroup>
                        <Label>End Date & Time</Label>
                        <Input 
                            type="datetime-local" 
                            required
                            value={filters.endDateTime}
                            onChange={(e) => handleInputChange('endDateTime', e.target.value)}
                        />
                    </FormGroup>
                </Col>
            </Row>
            <Row className="g-3">
                <Col md={6}>
                    <FormGroup>
                        <Label>Time Span</Label>
                        <Input 
                            type="select"
                            value={filters.timeSpan}
                            onChange={(e) => handleInputChange('timeSpan', e.target.value)}
                        >
                            <option value="">Select Interval</option>
                            <option value="15min">15 Minutes</option>
                            <option value="1h">1 Hour</option>
                            <option value="4h">4 Hours</option>
                            <option value="1d">1 Day</option>
                        </Input>
                    </FormGroup>
                </Col>
                <Col md={6}>
                    <FormGroup>
                        <Label>Group</Label>
                        <InputGroup>
                            <InputGroupText>
                                <FeatherIcon icon="folder" className="icon-xs" />
                            </InputGroupText>
                            <Input 
                                type="select"
                                value={filters.group}
                                onChange={(e) => handleInputChange('group', e.target.value)}
                            >
                                <option value="">Select Group</option>
                                {/* Add actual groups here */}
                            </Input>
                        </InputGroup>
                    </FormGroup>
                </Col>
            </Row>
            <Row className="g-3">
                <Col md={6}>
                    <FormGroup>
                        <Label>Tag</Label>
                        <InputGroup>
                            <InputGroupText>
                                <FeatherIcon icon="tag" className="icon-xs" />
                            </InputGroupText>
                            <Input 
                                type="select"
                                value={filters.tag}
                                onChange={(e) => handleInputChange('tag', e.target.value)}
                            >
                                <option value="">Select Tag</option>
                                {/* Add actual tags here */}
                            </Input>
                        </InputGroup>
                    </FormGroup>
                </Col>
                <Col md={6}>
                    <FormGroup>
                        <Label>Slot</Label>
                        <InputGroup>
                            <InputGroupText>
                                <FeatherIcon icon="hard-drive" className="icon-xs" />
                            </InputGroupText>
                            <Input 
                                type="select"
                                value={filters.slot}
                                onChange={(e) => handleInputChange('slot', e.target.value)}
                            >
                                <option value="">Select Slot</option>
                                {/* Add actual slots here */}
                            </Input>
                        </InputGroup>
                    </FormGroup>
                </Col>
            </Row>
        </>
    );

    return (
        <div className="page-content">
            <div className="container-fluid">
                <Row className="mb-4">
                    <Col xs={12}>
                        <div className="page-title-box d-flex align-items-center justify-content-between">
                            <h4 className="mb-0">Reports </h4>
                            {/* <div className="d-flex gap-2">
                                <Button color="light" className="d-flex align-items-center">
                                    <FeatherIcon icon="download" className="me-1" /> Export All
                                </Button>
                                <Button color="primary" className="d-flex align-items-center">
                                    <FeatherIcon icon="plus" className="me-1" /> New Report
                                </Button>
                            </div> */}
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

                {/* Recent Reports Section */}
                {/* <Row className="mt-4">
                    <Col xs={12}>
                        <Card>
                            <CardBody>
                                <div className="d-flex align-items-center justify-content-between mb-4">
                                    <h5 className="card-title mb-0">Recent Reports</h5>
                                    <Button color="light" size="sm">
                                        <FeatherIcon icon="refresh-cw" className="icon-xs me-1" /> Refresh
                                    </Button>
                                </div>
                                
                                <div className="table-responsive">
                                    <table className="table table-centered table-nowrap align-middle mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Report Name</th>
                                                <th>Type</th>
                                                <th>Generated On</th>
                                                <th>Status</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>Production_Report_20231214</td>
                                                <td>History</td>
                                                <td>14 Dec 2023, 10:30 AM</td>
                                                <td><span className="badge bg-success">Completed</span></td>
                                                <td>
                                                    <Button color="light" size="sm" className="me-1">
                                                        <FeatherIcon icon="download" className="icon-xs" />
                                                    </Button>
                                                    <Button color="light" size="sm">
                                                        <FeatherIcon icon="trash-2" className="icon-xs text-danger" />
                                                    </Button>
                                                </td>
                                            </tr>
                                          
                                        </tbody>
                                    </table>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row> */}
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
                                    <Input 
                                        type="datetime-local" 
                                        required
                                        value={filters.history.startDateTime}
                                        onChange={(e) => handleInputChange('history', 'startDateTime', e.target.value)}
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>
                                    <Label>End Date & Time</Label>
                                    <Input 
                                        type="datetime-local" 
                                        required
                                        value={filters.history.endDateTime}
                                        onChange={(e) => handleInputChange('history', 'endDateTime', e.target.value)}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <Label>Time Span</Label>
                                    <Input 
                                        type="select"
                                        value={filters.history.timeSpan}
                                        onChange={(e) => handleInputChange('history', 'timeSpan', e.target.value)}
                                    >
                                        <option value="">Select Time Span</option>
                                        <option value="15min">15 Minutes</option>
                                        <option value="1h">1 Hour</option>
                                        <option value="4h">4 Hours</option>
                                        <option value="1d">1 Day</option>
                                    </Input>
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>
                                    <Label>Group</Label>
                                    <Input 
                                        type="select"
                                        value={filters.history.group}
                                        onChange={(e) => handleInputChange('history', 'group', e.target.value)}
                                    >
                                        <option value="">Select Group</option>
                                        {/* Populate with actual groups */}
                                    </Input>
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <Label>Tag</Label>
                                    <Input 
                                        type="select"
                                        value={filters.history.tag}
                                        onChange={(e) => handleInputChange('history', 'tag', e.target.value)}
                                    >
                                        <option value="">Select Tag</option>
                                        {/* Populate with actual tags */}
                                    </Input>
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>
                                    <Label>Slot</Label>
                                    <Input 
                                        type="select"
                                        value={filters.history.slot}
                                        onChange={(e) => handleInputChange('history', 'slot', e.target.value)}
                                    >
                                        <option value="">Select Slot</option>
                                        {/* Populate with actual slots */}
                                    </Input>
                                </FormGroup>
                            </Col>
                        </Row>
                    </ModalBody>
                    <div className="modal-footer">
                        <Button type="button" color="light" onClick={toggleHistoryModal}>
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
                                    <Input 
                                        type="datetime-local" 
                                        required
                                        value={filters.flow.dateTime}
                                        onChange={(e) => handleInputChange('flow', 'dateTime', e.target.value)}
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>
                                    <Label>Slot</Label>
                                    <Input 
                                        type="select"
                                        value={filters.flow.slot}
                                        onChange={(e) => handleInputChange('flow', 'slot', e.target.value)}
                                    >
                                        <option value="">Select Slot</option>
                                        {/* Populate with actual slots */}
                                    </Input>
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <Label>Group</Label>
                                    <Input 
                                        type="select"
                                        value={filters.flow.group}
                                        onChange={(e) => handleInputChange('flow', 'group', e.target.value)}
                                    >
                                        <option value="">Select Group</option>
                                        {/* Populate with actual groups */}
                                    </Input>
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>
                                    <Label>Tag</Label>
                                    <Input 
                                        type="select"
                                        value={filters.flow.tag}
                                        onChange={(e) => handleInputChange('flow', 'tag', e.target.value)}
                                    >
                                        <option value="">Select Tag</option>
                                        {/* Populate with actual tags */}
                                    </Input>
                                </FormGroup>
                            </Col>
                        </Row>
                    </ModalBody>
                    <div className="modal-footer">
                        <Button type="button" color="light" onClick={toggleFlowModal}>
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