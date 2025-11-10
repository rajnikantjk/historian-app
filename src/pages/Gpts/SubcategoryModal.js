import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import {
  AddGptsSubcategory,
  EditGptsSubcategory,
  getGptsSubCategory,
} from "../../slices/gpts";
import {
  Button,
  Card,
  CardBody,
  Col,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
  TabPane,
  Spinner,
} from "reactstrap";
import { toast } from "react-toastify";
import MultiValueInput from "../../Components/Common/MultiValueInput";

const singleSelectStyle = {
  control: (provided) => ({
    ...provided,
    border: "1px solid #ced4da",
    boxShadow: "none",
    "&:hover": {
      border: "1px solid #ced4da",
    },
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#405189"
      : state.isFocused
      ? "#e9ecef"
      : "white",
    color: state.isSelected ? "white" : "black",
    "&:hover": {
      backgroundColor: "#e9ecef",
      color: "black",
    },
  }),
};
const SubcategoryModal = ({
  addModal,
  setAddModal,
  values,
  setValues,
  rowId,
  page,
}) => {
  const dispatch = useDispatch();
  const { gptCategoryData } = useSelector((state) => state.Gpt);
  const [errors, setErrors] = useState({});
  const [loader, setLoader] = useState(false);
  const handleOnChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };  const [enteredValues, setEnteredValues] = useState([]);
  useEffect(() => {
    if (rowId) {
      setEnteredValues(
        values?.metaKeywords ?  values?.metaKeywords?.flatMap((keyword) => keyword.split(",")):[]
      );
    }
  }, [values]);
  const handleAddEnteredValue = (newValue) => {
    setEnteredValues([...enteredValues, newValue]);
  };

  const handleRemoveEnteredValue = (valueToRemove) => {
    const filteredValues = enteredValues.filter(
      (value) => value !== valueToRemove
    );
    setEnteredValues(filteredValues);
  };
  const categoriesData = gptCategoryData
    ?.filter((item) => item?.status === "active")
    .map((item) => {
      return {
        value: item?._id,
        label: item?.name,
      };
    });

  const formValidation = () => {
    let isFormValid = true;
    let newErrors = {};
    const requiredFields = [
      "name",
      "description",
      "category",
      "metaImg"
    ];
    requiredFields.forEach((field) => {
      if (!values?.name || values?.name === "") {
        isFormValid = false;
        newErrors["name"] = "Please enter name";
      }
      if (!values?.description || values?.description === "") {
        isFormValid = false;
        newErrors["description"] = "Please enter description ";
      }
      if (!values?.category?.value || values?.category?.value === "") {
        isFormValid = false;
        newErrors["category"] = "Please select category";
      }

      if (!values?.metaImg) {
        isFormValid = false;
        newErrors["metaImg"] = "Please enter meta Img ";
      }
    });
    setErrors(newErrors);
    return isFormValid;
  };

  const handleOnAddCategory = () => {
    if (formValidation()) {
      setLoader(true);
      const formData = new FormData();
      formData.append("name", values?.name);
      formData.append("description", values?.description);
      formData.append("mainCategoryId", values?.category?.value);
      if (values?.metaTitle) {
        formData.append("metaTitle", values?.metaTitle);
      }
      if (values?.metaDescription) {
        formData.append("metaDescription", values?.metaDescription);
      }
       if (enteredValues?.length > 0) {
        formData.append(`metaKeywords[]`, enteredValues);
      }

      formData.append("metaImg", values?.metaImg);

      dispatch(
        AddGptsSubcategory({
          body: formData,
        })
      )
        .then((res) => {
          if (res?.payload?.success) {
            setAddModal(false);
            dispatch(getGptsSubCategory({ page: page }));
            setLoader(false);
            toast.success("Subcategory added successfully");
            setValues({});
          } else {
          toast.error(res?.payload?.message);
          setLoader(false);
          }
        })
        .catch((err) => {
          setLoader(false);
          toast.error(err.response.data.message);
        });
    }
  };

  const handleOnUpdateCategory = () => {
    if (formValidation()) {
      setLoader(true);
      const formData = new FormData();
      formData.append("name", values?.name);
      formData.append("description", values?.description);
      formData.append("mainCategoryId", values?.category?.value);
      if (values?.metaTitle) {
        formData.append("metaTitle", values?.metaTitle);
      }
      if (values?.metaDescription) {
        formData.append("metaDescription", values?.metaDescription);
      }
       if (enteredValues?.length > 0) {
        formData.append(`metaKeywords[]`, enteredValues);
      }
      formData.append("metaImg", values?.metaImg);
      dispatch(
        EditGptsSubcategory({
          body: formData,
          id: rowId,
        })
      )
        .then((res) => {
          if (res?.payload?.success) {
            setAddModal(false);
            setLoader(false);
            dispatch(getGptsSubCategory({ page: page }));
            toast.success("Subcategory Updated Successfully");
            setValues({});
          } else {
            setLoader(false);
          }
        })
        .catch((err) => {
          setLoader(false);
          toast.error(err.response.data.message);
        });
    }
  };
  const handleImageChange = (event, setImage) => {
    const file = event.target.files[0];
    if (file) {
      setValues({ ...values, metaImg: file });
      setErrors({ ...errors, metaImg: "" });
    }
  };
  const handleImageDelete = (name) => {
    setValues((prevState) => ({
      ...prevState,
      [name]: "",
    }));
  };

  return (
    <div>
      <Modal isOpen={addModal} id="exampleModal" size="lg">
        <ModalHeader
          toggle={() => {
            setAddModal(false);
            setValues({});
            setErrors({});
          }}
        >
          {rowId ? "Update GPT Subcategory" : "Add GPT Subcategory"}{" "}
        </ModalHeader>
        <ModalBody>
          <form>
            <Row>
              <Col lg={6}>
                {" "}
                <Card>
                  <CardBody>
                    <TabPane id="addproduct-metadata" tabId="2">
                      <div className="mt-2">
                        <label
                          htmlFor="customer-name"
                          className="col-form-label"
                        >
                          GPT Category: <span className="text-danger">*</span>
                          {errors?.category && (
                            <span className="text-danger">
                              {errors?.category}
                            </span>
                          )}
                        </label>
                        <Select
                          value={values?.category}
                          onChange={(e) => {
                            setValues({
                              ...values,
                              category: e,
                            });
                            setErrors({ ...errors, category: "" });
                          }}
                          options={categoriesData}
                          styles={singleSelectStyle}
                          placeholder="Select GPT Category"
                        />

                        <div className="mb-3">
                          <label
                            htmlFor="customer-name"
                            className="col-form-label"
                          >
                            Subcategory Name:{" "}
                            <span className="text-danger">*</span>
                            {errors?.name && (
                              <span className="text-danger">
                                {errors?.name}
                              </span>
                            )}
                          </label>
                          <Input
                            type="text"
                            className="form-control"
                            name="name"
                            placeholder="Enter subcategory name"
                            value={values?.name}
                            onChange={handleOnChange}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="message-text"
                            className="col-form-label"
                          >
                            Subcategory Description:
                            <span className="text-danger">*</span>
                            {errors.description && (
                              <span className="text-danger">
                                {errors?.description}
                              </span>
                            )}
                          </label>
                          <textarea
                            className="form-control"
                            rows="10"
                            name="description"
                            placeholder="Enter subcategory description"
                            value={values?.description}
                            onChange={handleOnChange}
                          ></textarea>
                        </div>
                      </div>
                    </TabPane>
                  </CardBody>
                </Card>
              </Col>
              <Col lg={6}>
                {" "}
                <Card>
                  <CardBody>
                    <TabPane id="addproduct-metadata" tabId="2">
                      <Row>
                        <label
                          htmlFor="message-text"
                          className="col-form-label"
                        >
                          Meta Image: <span className="text-danger">*</span>
                          {errors.metaImg && (
                            <span className="text-danger">
                              {errors.metaImg}
                            </span>
                          )}
                        </label>
                        <div className="text-center">
                          <div className="position-relative d-inline-block">
                            <div className="position-absolute top-100 start-100 translate-middle">
                              {!values?.metaImg ? (
                                <label
                                  htmlFor="tool-logo-input"
                                  className="mb-0"
                                  data-bs-toggle="tooltip"
                                  data-bs-placement="right"
                                  title={
                                    values?.metaImg
                                      ? "Delete Image"
                                      : "Select Image"
                                  }
                                >
                                  <div className="avatar-xs">
                                    <div className="avatar-title bg-light border rounded-circle text-muted cursor-pointer">
                                      <i className="ri-image-fill"></i>
                                    </div>
                                  </div>
                                </label>
                              ) : (
                                <div
                                  className="avatar-xs"
                                  onClick={() => handleImageDelete("metaImg")}
                                >
                                  <div className="avatar-title bg-light border rounded-circle text-muted cursor-pointer">
                                    <i className="ri-delete-bin-6-line"></i>
                                  </div>
                                </div>
                              )}
                              <input
                                className="form-control d-none"
                                defaultValue=""
                                id="tool-logo-input"
                                type="file"
                                name="metaImg"
                                accept="image/png, image/gif, image/jpeg"
                                onChange={(e) => handleImageChange(e)}
                              />
                            </div>
                            <div className="avatar-lg">
                              <div className="avatar-title bg-light rounded">
                                {values?.metaImg && (
                                  <img
                                    src={
                                      typeof values?.metaImg === "string"
                                        ? values?.metaImg
                                        : URL.createObjectURL(values?.metaImg)
                                    }
                                    id="tool-logo-img"
                                    alt=""
                                    className="avatar-md h-100 w-100 rounded"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mb-3">
                          <Label
                            className="form-label"
                            htmlFor="meta-title-input"
                          >
                            Meta title
                          </Label>
                          <Input
                            type="text"
                            className="form-control"
                            placeholder="Enter meta title"
                            id="meta-title-input"
                            value={values?.metaTitle}
                            name="metaTitle"
                            onChange={handleOnChange}
                          />
                        </div>

                        <div className="mb-3">
                          <Label
                            className="form-label"
                            htmlFor="meta-keywords-input"
                          >
                            Meta Keywords
                          </Label>
                          <Label
                            htmlFor="choices-text-remove-button"
                            className="form-label text-muted"
                          ></Label>
                         <MultiValueInput
                            handleAddEnteredValue={handleAddEnteredValue}
                            handleRemoveEnteredValue={handleRemoveEnteredValue}
                            enteredValues={enteredValues}
                            setEnteredValues={setEnteredValues}
                          />
                        </div>
                      </Row>

                      <div>
                        <Label
                          className="form-label"
                          htmlFor="meta-description-input"
                        >
                          Meta Description
                        </Label>
                        <textarea
                          className="form-control"
                          id="meta-description-input"
                          placeholder="Enter meta description"
                          rows="4"
                          value={values?.metaDescription}
                          name="metaDescription"
                          onChange={handleOnChange}
                        ></textarea>
                      </div>
                    </TabPane>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </form>
        </ModalBody>
        <div className="modal-footer">
          <Button
            color="light"
            onClick={() => {
              setAddModal(false);
              setValues({});
              setErrors({});
            }}
          >
            Close
          </Button>
          <Button
            color="primary"
            onClick={() => {
              rowId ? handleOnUpdateCategory() : handleOnAddCategory();
            }}
          >
            {loader && (
              <Spinner size="sm" className="flex-shrink-0">
                Loading...
              </Spinner>
            )}
            <span className="flex-grow-1 ms-2">
              {rowId ? "Update GPT Subcategory" : "Add GPT Subcategory"}
            </span>
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default SubcategoryModal;
