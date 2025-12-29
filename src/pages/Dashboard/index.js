import React, { useEffect, useState } from "react";
import { Col, Container, Row } from "reactstrap";
import Widget from "./Widgets";


const Dashboard = () => {
  document.title = "Dashboard | AlarmIQ - Historian/ PIMS";

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Row>
            <Col>
              <div className="h-100">
                <Row>
                  <Widget />
                </Row>
              </div>
            </Col>
          </Row></Container></div></React.Fragment>


  );
};

export default Dashboard;
