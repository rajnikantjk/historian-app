import React, { useEffect } from "react";
import { Row, Col, Label, Button } from "reactstrap";
import { updateOPCalarm } from "../../slices/tools";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Loader from "../../Components/Common/Loader";

const Setting = () => {
    document.title = "Settings | AlarmIQ - Historian/ PIMS";
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { toolLoader } = useSelector(
        (state) => state.Tool)
    const userRole = JSON.parse(localStorage.getItem("authUser"))?.role;

    useEffect(() => {
        if (userRole != "ROLE_ADMIN") {
            toast.error("You are not authorized to access this page");
            navigate("/dashboard");
        }

    }, [userRole])

    const handleToggle = (type) => {

        const body = {
            type: type,
        };
        dispatch(updateOPCalarm(body)).then((res) => {

            toast.success(res?.payload);

        })
            .catch((err) => {
                console.log(":err", err)
                toast.error(err);
            });
    }

    return (
        <div className="page-content">
            {toolLoader && <Loader />}
            <div className="m-4 p-4 bg-white rounded-3 shadow-sm">
                <h4 className="fs-18 fw-semibold mb-4 pb-2 border-bottom">OPC Service Control</h4>
                <Row className="g-4">
                    <Col xl={8} lg={10} md={12}>
                        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between p-3 bg-light rounded">
                            <div className="mb-3 mb-md-0">
                                <h6 className="mb-1 fw-medium">OPC Alarm Service</h6>
                                <p className="text-muted small mb-0">Manage the OPC Alarm service status</p>
                            </div>
                            <div className="d-flex gap-2">
                                <Button
                                    color="success"
                                    className="px-4"
                                    onClick={() => handleToggle('restart')}
                                >
                                    <i className="ri-restart-line align-middle me-1"></i> Restart
                                </Button>
                                <Button
                                    outline
                                    color="danger"
                                    className="px-4"
                                    onClick={() => handleToggle('stop')}
                                >
                                    <i className="ri-stop-circle-line align-middle me-1"></i> Stop
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default Setting;