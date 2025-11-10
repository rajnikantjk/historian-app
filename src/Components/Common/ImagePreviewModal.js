import PropTypes from "prop-types";
import React from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";

const ImagePreviewModal = ({ show, onCloseClick, src ,text}) => {
  return (
    <Modal
      fade={true}
      isOpen={show}
      toggle={onCloseClick}
      centered={true}
      style={{ maxWidth: "500px", maxHeight: "500px" }}
    >
      <ModalHeader toggle={onCloseClick}  style={{ textTransform: "capitalize" }}>{text ?? ""} Image Preview </ModalHeader>
      <ModalBody className="py-3 px-5" style={{ width: "500px", height: "500px" }}>
        <img
          src={src}
          style={{ width: "100%", height: "100%", objectFit: "contain"}}
          alt="Preview"
        />
      </ModalBody>
    </Modal>
  );
};

ImagePreviewModal.propTypes = {
  onCloseClick: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
  src: PropTypes.string.isRequired,
};

export default ImagePreviewModal;
