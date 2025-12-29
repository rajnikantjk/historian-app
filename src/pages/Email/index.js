import React, { useRef, useState } from "react";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import {
  Card,
  CardBody,
  Col,
  Container,
  CardHeader,
  Row,
  Input,
  Label,
  Button,
  FormFeedback,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import { toast } from "react-toastify";
import Loader from "../../Components/Common/Loader";
import { sentEmail } from "../../slices/newsLatter";

import { BUTTON_LIST } from "../../helpers/constnt";

// Register the plugins
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

const EmailPage = (props) => {
  const [inputValue, setInputValue] = useState({});
  const { newsLatterLoader } = useSelector((state) => state.NewsLatter);
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const isInitialLoad = useRef(true);
  const isResetting = useRef(false);
  document.title = `Email | AlarmIQ - Historian/ PIMS`;
  const fileInputRef = useRef(null);
  const validateField = (fieldName, value) => {
    let error = null;

    switch (fieldName) {
      case "subject":
        if (!value) error = "Subject is required";
        break;
      case "file":
        if (!value) error = "Excel file is required";
        else if (!value.name.endsWith(".xlsx") && !value.name.endsWith(".xls"))
          error = "Only .xlsx or .xls files are allowed";
        break;
      case "description":
        if (!value) error = "Description is required";
        break;
      default:
        break;
    }

    return error; // Return the error, if any
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    const fieldsToValidate = ["subject", "file", "description"];
    fieldsToValidate?.forEach((field) => {
      const error = validateField(field, inputValue[field]);
      if (error) {
        newErrors[field] = error;
      }
    });
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    if (isValid) {
      const formData = new FormData();
      formData.append("file", inputValue?.file);
      formData.append("emailTemplate", inputValue?.description);
      formData.append("subject", inputValue?.subject);
      dispatch(sentEmail(formData))
        .then((res) => {
          if (res?.payload?.success) {
            toast.success("Sent email successfully.");
            handleReset();
          }
        })
        .catch(() => { });
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputValue((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));

    const error = validateField(name, value);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.name.endsWith(".xlsx") || file.name.endsWith(".xls"))) {
      setInputValue((prevValues) => ({
        ...prevValues,
        file: file,
      }));

      const reader = new FileReader();
      reader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        const fileContent = data.toString();
        setInputValue((prevValues) => ({
          ...prevValues,
          fileContent: fileContent,
        }));
      };
      reader.readAsArrayBuffer(file);
      setErrors((prevErrors) => ({
        ...prevErrors,
        file: "",
      }));
      fileInputRef.current.value = null;
    } else {
      fileInputRef.current.value = null;
      setInputValue((prevValues) => ({
        ...prevValues,
        file: "",
      }));

      setErrors((prevErrors) => ({
        ...prevErrors,
        file: "Only .xlsx or .xls files are allowed",
      }));
    }
  };
  const handleDescription = (editor) => {
    if (isResetting.current) {
      return;
    }
    const data = editor
    setInputValue((prevValues) => ({
      ...prevValues,
      description: data.trimStart(),
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      description: data.trimStart() ? "" : "Description is required",
    }));
  };


  const handleReset = () => {
    isResetting.current = true;
    setInputValue({
      subject: "",
      description: "",
    });
    setErrors({});
    fileInputRef.current.value = null;
    setTimeout(() => {
      isResetting.current = false;
    }, 0);
  };
  return (
    <div className="page-content">
      {newsLatterLoader && <Loader />}
      <Container fluid>
        <BreadCrumb title={`Email`} pageTitle="Email" />
        <div className="text-end mb-3">
          <Button
            type="submit"
            className="btn btn-success w-sm me-2"
            onClick={(e) => (newsLatterLoader ? {} : handleSubmit(e))}
            disabled={newsLatterLoader}
          >
            Sent
          </Button>

          <Button
            type="button"
            className="btn btn-primary w-sm"
            onClick={() => {
              handleReset();
            }}
          >
            Cancel
          </Button>
        </div>
        <Row>
          <Col>
            <Row>
              <Col md={12} lg={6} xxl={6}>
                <Card>
                  <CardHeader>
                    <h5 className="card-title mb-0">Email Subject</h5>
                  </CardHeader>
                  <CardBody>
                    <div className="row">
                      <div className="col-12 ">
                        <Label className="form-label" htmlFor="subject">
                          Subject<span className="text-danger">*</span>{" "}
                          {errors?.subject && (
                            <span
                              className="text-danger"
                              style={{
                                fontSize: "12px",
                              }}
                            >
                              {errors?.subject}
                            </span>
                          )}
                        </Label>
                        <Input
                          type="text"
                          // className={`form-control ${
                          //   errors.subject ? "is-invalid" : ""
                          // }`}
                          id="subject"
                          name="subject"
                          placeholder="Enter subject"
                          value={inputValue.subject || ""}
                          onChange={handleInputChange}
                          autoComplete="off"
                        />
                        {errors.subject && (
                          <FormFeedback>{errors.subject}</FormFeedback>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Col>
              <Col md={12} lg={6} xxl={6}>
                <Card>
                  <CardHeader>
                    <h5 className="card-title mb-0">Upload Excel</h5>
                  </CardHeader>
                  <CardBody>
                    <div className="row">
                      <div className="col-12">
                        <Label className="form-label" htmlFor="fileUpload">
                          Upload Excel File
                          <span className="text-danger">*</span>{" "}
                          {errors?.file && (
                            <span
                              className="text-danger"
                              style={{
                                fontSize: "12px",
                              }}
                            >
                              {errors?.file}
                            </span>
                          )}
                        </Label>
                      </div>

                      <div className="file-upload d-flex align-items-center">
                        <label
                          htmlFor="fileUpload"
                          className="btn btn-primary mb-0"
                          style={{ backgroundColor: "#405189", color: "white" }}
                        >
                          <i className="fas fa-cloud-upload-alt mr-2"></i>{" "}
                          Upload File{" "}
                          <input
                            type="file"
                            accept=".xlsx, .xls"
                            id="fileUpload"
                            name="file"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            style={{ display: "none" }}
                          />
                        </label>
                        {inputValue.file && (
                          <span className="ms-2">{inputValue.file.name}</span>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>

            <Card>
              <CardHeader>
                <h5 className="card-title mb-0">Newsletter HTML Content</h5>
              </CardHeader>
              <CardBody>
                <div className="mb-2">
                  <Label>
                    HTML Content <span className="text-danger">*</span>{" "}
                    {errors?.description && (
                      <span
                        className="text-danger"
                        style={{
                          fontSize: "12px",
                        }}
                      >
                        {errors?.description}
                      </span>
                    )}
                  </Label>

                  <div className="editor-container">


                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default EmailPage;
