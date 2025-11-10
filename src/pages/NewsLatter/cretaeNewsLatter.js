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
import { sentNewsLatter } from "../../slices/newsLatter";

import { BUTTON_LIST } from "../../helpers/constnt";
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

const CreateNewsLatter = (props) => {
  const [inputValue, setInputValue] = useState({});
  const { newsLatterLoader } = useSelector((state) => state.NewsLatter);
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const isResetting = useRef(false);
  document.title = `Sent Newsletter | Augmation Tech`;

  const validateField = (fieldName, value) => {
    let error = null;
    switch (fieldName) {
      case "subject":
        if (!value) error = "Subject is required";
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
      const obj = {
        subject: inputValue?.subject,
        emailTemplate: inputValue?.description,
      };
      dispatch(sentNewsLatter(obj))
        .then((res) => {
          if (res?.payload?.success) {
            toast.success("Sent newslatter successfully.");
            handleReset();
          }
        })
        .catch(() => {});
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    setInputValue({
      ...inputValue,
      subject: e?.target?.value?.trimStart(),
    });
    const error = validateField("subject", e?.target?.value?.trimStart());

    setErrors({
      ...errors,
      [e?.target?.name]: error,
    });
  };

  const handleDescription = (editor) => {
    if (isResetting.current) {
      return;
    }
    const data = editor;
    setInputValue({
      ...inputValue,
      description: data?.trimStart(),
    });
    setErrors({
      ...errors,
      description: data?.trimStart() ? "" : "Description is required",
    });
  };

  const handleReset = () => {
    isResetting.current = true;
    setInputValue({
      subject: "",
      description: "",
    });
    setErrors({});
    setTimeout(() => {
      isResetting.current = false;
    }, 0);
  };

  return (
    <div className="page-content">
      {newsLatterLoader && <Loader />}
      <Container fluid>
        <BreadCrumb title={`Sent Newsletter`} pageTitle="Newsletter" />
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
            onClick={handleReset}
          >
            Cancel
          </Button>
        </div>
        <Row>
          <Col>
            <Card>
              <CardHeader>
                <h5 className="card-title mb-0">Newsletter Subject</h5>
              </CardHeader>
              <CardBody>
                <div className="row">
                  <div className="col-12 col-sm-6">
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
                      className="form-control"
                      id="subject"
                      placeholder="Enter subject"
                      name="subject"
                      value={inputValue?.subject?.trimStart() || ""}
                      onChange={handleChange}
                      autoComplete="off"
                    />
                  </div>
                </div>
              </CardBody>
            </Card>

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
                </div>{" "}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CreateNewsLatter;
