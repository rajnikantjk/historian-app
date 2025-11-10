import React from "react";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

const CommonModal = ({
  isOpen,
  onSubmit,
  onCloseClick,
  body,
  buttonText,
  header,
  isDisabled,
  size
}) => {
  return (
    <Modal
      fade={true}
      isOpen={isOpen}
      toggle={onCloseClick}
      centered={true}
      size={size ? size : 'md'}     
    >
      <ModalHeader>
        <h5>{header}</h5>
      </ModalHeader>
      <ModalBody className="py-3 px-3" >{body}</ModalBody>
      {buttonText && (
      
      <ModalFooter>
        <div className="d-flex gap-2 justify-content-center mt-4 mb-2">
          <button
            type="button"
            className="btn w-sm btn-light"
            data-bs-dismiss="modal"
            onClick={onCloseClick}
          >
            Close
          </button>
          <button
            type="button"
            className="btn w-sm btn-danger "
            id="delete-record"
            onClick={onSubmit}
            disabled={isDisabled}
          >
            {buttonText}
          </button>
        </div>
      </ModalFooter>
      )}
    </Modal>
  );
};



export default CommonModal;
