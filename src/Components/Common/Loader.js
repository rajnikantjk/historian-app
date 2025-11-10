import React from "react";
import { Spinner } from "reactstrap";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Loader = () => {
  return (
    <React.Fragment>
      {/* <div className="d-flex justify-content-center mx-2 mt-2">
        <Spinner color="primary"> Loading... </Spinner>
      </div> */}
      <div
        style={{
          position: "fixed",
          top: "0",
          left: "0",
          width: "100%",
          height: "100vh",
          background: " rgba(0, 0, 0, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: "99999999999999999",
        }}
      >
        <div className="loading">
          <Spinner
            className="me-2"
            style={{
              height: "4rem",
              width: "4rem",
            }}
            color="primary"
            type="grow"
          ></Spinner>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Loader;
