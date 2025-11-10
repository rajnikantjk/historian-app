import React from "react";
import { Row, Col, Label, Button } from "reactstrap";
import { updateOPCalarm } from "../../slices/tools";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

const Setting = () => {
     const dispatch = useDispatch();

    const handleToggle = (type) => {

        const body = {
            type: type,
        };
         dispatch(updateOPCalarm(body)).then((res) => {
               
                        toast.success(res?.payload?.message);
                
               })
                 .catch((err) => {
                   console.log(":err", err)
                   toast.error(err);
                 });
    }

    return (
        <div className="page-content">
            <div className=" m-4 p-4 bg-white">
                <h4 className="fs-16 mb-4">Settings</h4>
                <Row>
                    <Col md={6} className="d-flex align-items-center justify-content-between">
                        <Label className="mb-0">OPC Alarm Service</Label>
                        <div className="d-flex align-items-center gap-3">
                        <Button
                            color="success"
                            onClick={() => handleToggle('start')}
                        >
                            Start
                        </Button>

                        <Button
                            color="danger"
                            onClick={() => handleToggle('stop')}
                        >
                            Stop
                        </Button>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default Setting;