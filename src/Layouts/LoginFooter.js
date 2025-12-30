import React from 'react';
import { Col, Container, Row } from 'reactstrap';

const LoginFooter = () => {
    return (
        <React.Fragment>
            <footer className="login-footer">
                <Container fluid>
                    <Row>
                        <Col sm={6}>
                            © {new Date().getFullYear()} Augmation Technologies Pvt. Ltd. All rights reserved.

                        </Col>
                        <Col sm={6}>
                            <div className="text-sm-end d-none d-sm-block">
                                Developed by Augmation Technologies | <a href="https://augmation.co/" target='_blank'>www.augmation.co</a>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </footer>
        </React.Fragment>
    );
};

export default LoginFooter;