import React, { useEffect, useState } from "react";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import {
  Card,
  CardBody,
  Col,
  Container,
  CardHeader,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
  Input,
  Label,
  Button,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import classnames from "classnames";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { registerPlugin } from "react-filepond";
import Select from "react-select";
import "filepond/dist/filepond.min.css";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import {
  CREATE_GPT_VALUE,
  WEBSITE_URL,
  multiSelectStyle,
  singleSelectStyle,
} from "../../helpers/constnt";
import { toast } from "react-toastify";
import {
  createAiTool,
  getTools,
  getTagGroupList,
} from "../../slices/tools";
import CommonModal from "../../Components/Common/CommonModal";
import MultiValueInput from "../../Components/Common/MultiValueInput";
import Loader from "../../Components/Common/Loader";
import {
  createGPT,
  getGpts,
  getGptsSubCategory,
  updateGPT,
} from "../../slices/gpts";

// Register the plugins
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

const CreateGpt = (props) => {
  const [enteredValues, setEnteredValues] = useState([]);

  const [inputValue, setInputValue] = useState({});
  const [isOpenModal, setIsOpenModal] = useState(false);
  const { gptSubcategoryLoader, gptLoader, gptData } = useSelector(
    (state) => state.Gpt
  );
  const [gptSubCategoryData, setGptSubCategoryData] = useState([]);
  const [featureData, setFeatureData] = useState([]);
  const [promptData, setPromptData] = useState([]);
  const [customActiveTab, setcustomActiveTab] = useState(1);
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const { slugId } = useParams();
  const { pathname } = useLocation();
  const loader = gptSubcategoryLoader || gptLoader;
  document.title = `${slugId ? "Update" : "Create"} GPT | Augmation Tech`;

  useEffect(() => {
    const params = {};
    params.page = 1;
    params.limit = 130;
    params.status = "active";

    dispatch(
      getGptsSubCategory({
        ...params,
      })
    )
      .then((res) => {
        if (res?.payload?.success) {
          const data = res?.payload?.payload?.categorys?.map((item) => {
            return {
              value: item?._id,
              label: item?.name,
            };
          });
          setGptSubCategoryData(data);
        }
      })
      .catch(() => {});
    setErrors({});
    if (slugId) {
      handleGetGPTData();
    } else {
      setInputValue(CREATE_GPT_VALUE);
      setErrors({});
    }
  }, [pathname, slugId]);
  const handleAddFeature = () => {
    for (let feature of featureData) {
      if (feature.name === "" || feature.description === "") {
        setErrors({
          ...errors,
          feature: "Please fill out all fields before adding a new feature.",
        });
        return;
      } else {
        setErrors({
          ...errors,
          feature: "",
        });
      }
    }

    const obj = { name: "", description: "" };
    setFeatureData([...featureData, obj]);
  };

  const handleDeleteFeature = (index) => {
    const data = featureData.filter((_, i) => i !== index);
    setFeatureData(data);
    setErrors({
      ...errors,
      feature: "",
    });
  };
  const handleAddPrompt = () => {
    for (let prompt of promptData) {
      if (!prompt) {
        setErrors({
          ...errors,
          prompt: "Please fill out all fields before adding a new prompt.",
        });
        return;
      } else {
        setErrors({
          ...errors,
          prompt: "",
        });
      }
    }

    setPromptData([...promptData, ""]);
  };

  const handleDeletePrompt = (index) => {
    const data = promptData.filter((_, i) => i !== index);
    setPromptData(data);
    setErrors({
      ...errors,
      prompt: "",
    });
  };
  const handleInputChange = (key, index, value, field) => {
    const val = value?.trimStart();
    const updatedFeatures = featureData.map((feature, i) =>
      i === index ? { ...feature, [field]: val } : feature
    );
    const updatedPrompt = promptData.map((prompt, i) =>
      i === index ? val : prompt
    );
    if (key === "feature") {
      setFeatureData(updatedFeatures);
    } else {
      setPromptData(updatedPrompt);
    }
  };
  const handleGetGPTData = () => {
    const params = {};
    params.slugId = slugId;
    params.page = 1;
    params.limit = 10;
    if (slugId) {
      dispatch(
        getGpts({
          ...params,
        })
      ).then((res) => {
        const data = res?.payload?.payload?.app[0];
        if (res?.payload?.success) {
          const val = {
            projectName: data?.projectName || "",
            description: data?.description || "",
            categoryId: data?.category[0]?._id || "",
            icon: data?.icon || "",
            iconFile: data?.icon || "",
            authorName: data?.authorName || "",
            websiteLink: data?.websiteLink || "",
            instagramLink: data?.instagramLink || "",
            linkedInLink: data?.linkedInLink || "",
            facebookLink: data?.facebookLink || "",
            twitterLink: data?.twitterLink || "",
            youTubeLink: data?.youTubeLink || "",
            status: data?.status || "",
          };

          try {
            if (data?.featuresAndFunctions) {
              const featuresAndFunctions = data.featuresAndFunctions.replace(
                /'/g,
                '"'
              );
              setFeatureData(JSON.parse(featuresAndFunctions) || []);
            } else {
              setFeatureData([]);
            }
          } catch (error) {
            setFeatureData([]);
          }

          try {
            if (data?.promptStater) {
              const promptStater = data.promptStater.replace(/'/g, '"');
              setPromptData(JSON.parse(promptStater) || []);
            } else {
              setPromptData([]);
            }
          } catch (error) {
            setPromptData([]);
          }

          setInputValue(val);
        }
      });
    }
  };

  const validateField = (fieldName, value) => {
    let error = null;
    switch (fieldName) {
      case "projectName":
        if (!value) error = "GPT Name is required";
        break;
      case "icon":
        if (!value) error = "GPT logo is required";
        break;
      case "authorName":
        if (!value) error = "Author name is required";
        break;
      case "websiteLink":
        if (!value) error = "Website URL is required";
        else if (!WEBSITE_URL?.test(value)) error = "Website URL is not valid";
        break;
      case "youTubeLink":
      case "instagramLink":
      case "facebookLink":
      case "twitterLink":
      case "linkedInLink":
        if (value && !WEBSITE_URL?.test(value)) error = "URL is not valid";
        break;

      case "categoryId":
        if (!value) error = "Subcategory is required";
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
    const fieldsToValidate = [
      "projectName",
      "description",
      "categoryId",
      "icon",
      "authorName",
      "websiteLink",
      "instagramLink",
      "linkedInLink",
      "facebookLink",
      "twitterLink",
      "youTubeLink",
    ];

    fieldsToValidate?.forEach((field) => {
      const error = validateField(field, inputValue[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    const featureErrors = featureData?.map((feature, index) => {
      let featureError = "";
      if (!feature.name && !feature.description) {
        featureError = `Feature data is missing in row ${index + 1}`;
      } else if (!feature.name) {
        featureError = `Feature name is missing in row ${index + 1}`;
      } else if (!feature.description) {
        featureError = `Feature description is missing in row ${index + 1}`;
      } else {
        featureError = "";
      }
      return featureError;
    });
    if (featureErrors.some((error) => Object.keys(error).length > 0)) {
      newErrors["feature"] = featureErrors;
    }
    const promptErrors = promptData.map((prompt, index) => {
      let promptError = "";
      if (!prompt) {
        promptError = `Prompt data is missing in row ${index + 1}`;
      } else {
        promptError = "";
      }
      return promptError;
    });
    if (promptErrors.some((error) => Object.keys(error).length > 0)) {
      newErrors["prompt"] = promptErrors;
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;

    if (isValid) {
      const formdata = new FormData();
      formdata.append("projectName", inputValue?.projectName);
      formdata.append("description", inputValue?.description);
      formdata.append("categoryId", inputValue?.categoryId);
      formdata.append("websiteLink", inputValue?.websiteLink);
      formdata.append("icon", inputValue?.iconFile);
      formdata.append("authorName", inputValue?.authorName);
      formdata.append("status", inputValue?.status?.toLowerCase());
      if (inputValue.instagramLink) {
        formdata.append("instagramLink", inputValue.instagramLink);
      }
      if (inputValue.linkedInLink) {
        formdata.append("linkedInLink", inputValue.linkedInLink);
      }
      if (inputValue.facebookLink) {
        formdata.append("facebookLink", inputValue.facebookLink);
      }
      if (inputValue.twitterLink) {
        formdata.append("twitterLink", inputValue.twitterLink);
      }
      if (inputValue.youTubeLink) {
        formdata.append("youTubeLink", inputValue.youTubeLink);
      }
      if (promptData?.length) {
        const formattedString =
          "[" + promptData.map((prompt) => `'${prompt}'`).join(", ") + "]";

        formdata.append("promptStater", formattedString);
      } else {
        formdata.append("promptStater", "[]");
      }
      if (featureData?.length) {
        let formattedString = "[";
        featureData.forEach((item, index) => {
          formattedString += "{";
          Object.entries(item).forEach(([key, value], i) => {
            formattedString += `'${key}': '${value}'`;
            if (i < Object.keys(item).length - 1) {
              formattedString += ", ";
            }
          });
          formattedString += "}";
          if (index < featureData.length - 1) {
            formattedString += ", ";
          }
        });
        formattedString += "]";

        formdata.append("featuresAndFunctions", formattedString);
      } else {
        formdata.append("featuresAndFunctions", "[]");
      }
      if (!slugId) {
        dispatch(createGPT({ body: formdata }))
          .then((res) => {
            if (res?.payload?.success) {
              toast.success("GPT submitted successfully");
              navigate("/gpts");
            } else {
              toast.error(res?.payload?.data?.message);
              setInputValue(CREATE_GPT_VALUE);
              setErrors({});
            }
          })
          .catch((err) => {});
      } else {
        dispatch(updateGPT({ body: formdata, id: gptData[0]?._id }))
          .then((res) => {
            if (res?.payload?.success) {
              toast.success("AI tools updated successfully");
              navigate("/gpts");
            } else {
              toast.error(res?.payload?.data?.message);
            }
          })
          .catch((err) => {});
      }
    }
  };
  const handleImageChange = (event, setImage) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInputValue({
          ...inputValue,
          [event?.target?.name]: reader.result,
          [`${event?.target?.name}File`]: file,
        });
        const error = validateField(event?.target?.name, reader.result);
        setErrors({
          ...errors,
          [event?.target?.name]: error,
        });
      };
      reader.readAsDataURL(file);
    }
    event.target.value = "";
  };
  const handleImageDelete = (name) => {
    setInputValue({
      ...inputValue,
      [name]: "",
      [`${event?.target?.name}File`]: "",
    });

    const error = validateField(name, "");
    setErrors({
      ...errors,
      [name]: error,
    });
  };
  const handleOnChange = (e) => {
    const { name, value } = e?.target;

    setInputValue({
      ...inputValue,
      [name]: value?.trimStart(),
    });
    const error = validateField(name, value?.trimStart());

    setErrors({
      ...errors,
      [name]: error,
    });
  };

  return (
    <div className="page-content">
      {loader && <Loader />}
      <Container fluid>
        <BreadCrumb
          title={`${slugId ? "Update" : "Create"} GPT`}
          pageTitle="GPT"
        />
        <div className="text-end mb-3">
          <Button
            type="submit"
            className="btn btn-success w-sm me-2"
            onClick={(e) => (loader ? {} : handleSubmit(e))}
            disabled={loader}
          >
            Submit
          </Button>
          {slugId && (
            <Button
              type="button"
              className="btn btn-primary w-sm"
              onClick={() => {
                navigate("/gpts");
              }}
            >
              Cancel
            </Button>
          )}
        </div>
        <Row>
          <Col lg={8}>
            <Card>
              <CardHeader>
                <h5 className="card-title mb-0">GPT Details</h5>
              </CardHeader>
              <CardBody>
                <div className="mb-3 row">
                  <div className="col-12 col-sm-6">
                    <Label className="form-label" htmlFor="gpt-name">
                      GPT Name <span className="text-danger">*</span>{" "}
                      {errors?.projectName && (
                        <span
                          className="text-danger"
                          style={{
                            fontSize: "12px",
                          }}
                        >
                          {errors?.projectName}
                        </span>
                      )}
                    </Label>
                    <Input
                      type="text"
                      className="form-control"
                      id="gpt-name"
                      placeholder="Enter gpt name"
                      name="projectName"
                      value={inputValue?.projectName}
                      onChange={handleOnChange}
                    />
                  </div>
                  <div className="col-12 col-sm-6 mt-3 mt-md-0">
                    {" "}
                    <div>
                      <Label className="form-label" htmlFor="website-url">
                        Website URL <span className="text-danger">*</span>{" "}
                        {errors?.websiteLink && (
                          <span
                            className="text-danger"
                            style={{
                              fontSize: "12px",
                            }}
                          >
                            {errors?.websiteLink}
                          </span>
                        )}
                      </Label>
                    </div>
                    <div className="input-container">
                      <Input
                        type="text"
                        className="form-control"
                        id="website-url"
                        placeholder="Enter website url"
                        name="websiteLink"
                        value={inputValue?.websiteLink}
                        onChange={handleOnChange}
                      />
                      {slugId && inputValue?.websiteLink && (
                        <>
                          <span className="vertical-line"></span>

                          <a
                            href={inputValue?.websiteLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="icon-link"
                          >
                            <i class="ri-links-line"></i>{" "}
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </div>{" "}
                <div className="mb-3 row">
                  <div className="col-12 col-sm-6">
                    <Label className="form-label" htmlFor="categoryId">
                      GPT SubCategory <span className="text-danger">*</span>{" "}
                      {errors?.categoryId && (
                        <span
                          className="text-danger"
                          style={{
                            fontSize: "12px",
                          }}
                        >
                          {errors?.categoryId}
                        </span>
                      )}
                    </Label>
                    <Select
                      id="categoryId"
                      value={
                        inputValue?.categoryId
                          ? gptSubCategoryData?.find(
                              (item) => item?.value == inputValue?.categoryId
                            )
                          : ""
                      }
                      onChange={(e) => {
                        setInputValue({
                          ...inputValue,
                          categoryId: e?.value,
                        });
                        setErrors({
                          ...errors,
                          categoryId: e?.value ? "" : "Category is required",
                        });
                      }}
                      placeholder="Select subcategory"
                      options={gptSubCategoryData}
                      styles={singleSelectStyle}
                    />
                  </div>{" "}
                  <div className="col-12 col-sm-6 mt-3 mt-md-0">
                    <Label className="form-label" htmlFor="coupon-deals">
                      Author Name <span className="text-danger">*</span>
                      {errors?.authorName && (
                        <span
                          className="text-danger"
                          style={{
                            fontSize: "12px",
                          }}
                        >
                          {errors?.authorName}
                        </span>
                      )}
                    </Label>
                    <Input
                      type="text"
                      className="form-control"
                      id="coupon-deals"
                      placeholder="Enter author name"
                      name="authorName"
                      value={inputValue?.authorName}
                      onChange={handleOnChange}
                    />
                  </div>
                </div>
                <div className="mb-2">
                  <Label>
                    GPT Description <span className="text-danger">*</span>{" "}
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

                  <textarea
                    className="form-control"
                    rows="5"
                    value={inputValue?.description}
                    name="description"
                    onChange={handleOnChange}
                    placeholder="Write a description of your gpt"
                  ></textarea>
                </div>{" "}
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <div className="card-title mb-0 d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    Features And Functions{" "}
                    {errors?.feature && (
                      <span
                        className="text-danger"
                        style={{
                          fontSize: "12px",
                        }}
                      >
                        {errors?.feature}
                      </span>
                    )}
                  </h5>
                  <Button
                    type="submit"
                    className="btn btn-success w-sm me-2"
                    onClick={handleAddFeature}
                  >
                    + Add
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                <div className="container-fluid m-0 p-0">
                  {featureData?.length ? (
                    <div className="row ">
                      {featureData?.map((feature, index) => (
                        <div className="col col-md-6 mb-3" key={index}>
                          <div className="border p-3">
                            <div className="d-flex justify-content-end pe-0">
                              <div className="avatar-xs">
                                <span
                                  className="avatar-title rounded fs-5 bg-soft-danger cursor-pointer"
                                  onClick={() => handleDeleteFeature(index)}
                                >
                                  <i className="ri-delete-bin-fill align-bottom text-danger"></i>
                                </span>
                              </div>
                            </div>
                            <div className="mb-3">
                              <Label
                                className="form-label"
                                htmlFor={`feature-name-${index}`}
                              >
                                Features Name
                              </Label>
                              <Input
                                type="text"
                                className="form-control"
                                id={`feature-name-${index}`}
                                placeholder="Enter feature name"
                                value={feature.name}
                                onChange={(e) =>
                                  handleInputChange(
                                    "feature",
                                    index,
                                    e.target.value,
                                    "name"
                                  )
                                }
                              />
                            </div>
                            <div className="mb-3">
                              <Label
                                className="form-label"
                                htmlFor={`feature-description-${index}`}
                              >
                                Features Description
                              </Label>
                              <textarea
                                type="text"
                                className="form-control"
                                rows={5}
                                id={`feature-description-${index}`}
                                placeholder="Enter feature description"
                                value={feature.description}
                                onChange={(e) =>
                                  handleInputChange(
                                    "feature",
                                    index,
                                    e.target.value,
                                    "description"
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted">
                      <p>
                        No features have been added yet. Click the "+ Add"
                        button to get started.
                      </p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <div className="card-title mb-0 d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    Prompt Starter{" "}
                    {errors?.prompt && (
                      <span
                        className="text-danger"
                        style={{
                          fontSize: "12px",
                        }}
                      >
                        {errors?.prompt}
                      </span>
                    )}
                  </h5>
                  <Button
                    type="submit"
                    className="btn btn-success w-sm me-2"
                    onClick={handleAddPrompt}
                  >
                    + Add
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                <div className="container-fluid m-0 p-0">
                  {promptData?.length ? (
                    <div className="row ">
                      {promptData?.map((prompt, index) => {
                        return (
                          <div className="col col-md-6  mb-3" key={index}>
                            <div className="border p-3">
                              <div className="d-flex justify-content-end pe-0">
                                <div className="avatar-xs ">
                                  <span
                                    className="avatar-title rounded fs-5 bg-soft-danger cursor-pointer"
                                    onClick={() => handleDeletePrompt(index)}
                                  >
                                    <i className="ri-delete-bin-fill align-bottom text-danger"></i>
                                  </span>
                                </div>
                              </div>
                              <div className="">
                                <Label
                                  className="form-label"
                                  htmlFor="gpt-name"
                                >
                                  Prompt
                                </Label>
                                <Input
                                  type="text"
                                  className="form-control"
                                  id="gpt-name"
                                  placeholder="Enter prompt"
                                  value={prompt}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "prompt",
                                      index,
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center text-muted">
                      <p>
                        No prompt have been added yet. Click the "+ Add" button
                        to get started.
                      </p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col lg={4}>
            <Card>
              <CardHeader>
                <h5 className="card-title mb-0">GPT Gallery</h5>
              </CardHeader>
              <CardBody>
                <div className="container">
                  <div className="row">
                    <h5 className="fs-14 mb-4">
                      GPT Image <span className="text-danger">*</span>
                      {errors?.icon && (
                        <span
                          className="text-danger"
                          style={{
                            fontSize: "12px",
                          }}
                        >
                          {errors?.icon}
                        </span>
                      )}
                    </h5>
                    <div className="text-start">
                      <div className="position-relative d-inline-block">
                        <div className="position-absolute top-100 start-100 translate-middle">
                          {!inputValue?.icon ? (
                            <label
                              htmlFor="gpt-icon"
                              className="mb-0"
                              data-bs-toggle="tooltip"
                              data-bs-placement="right"
                              title=""
                              data-bs-original-title="Select Image"
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
                              onClick={() => handleImageDelete("icon")}
                            >
                              <div className="avatar-title bg-light border rounded-circle text-muted cursor-pointer">
                                <i className="ri-delete-bin-6-line"></i>
                              </div>
                            </div>
                          )}
                          <input
                            className="form-control d-none"
                            defaultValue=""
                            id="gpt-icon"
                            type="file"
                            name="icon"
                            accept="image/png, image/gif, image/jpeg"
                            onChange={(e) => {
                              handleImageChange(e);
                            }}
                          />
                        </div>
                        <div className="avatar-lg">
                          <div className="avatar-title bg-light rounded">
                            {inputValue?.icon && (
                              <img
                                src={inputValue?.icon}
                                id="gpt-website-img"
                                alt=""
                                className="avatar-md h-100 w-100 rounded"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardHeader>
                <h5 className="card-title mb-0">Social media</h5>
              </CardHeader>
              <CardBody>
                <div className="mb-3">
                  <div>
                    <Label className="form-label" htmlFor="YouTube-channelLink">
                      YouTube Social Media Link{" "}
                      {errors?.youTubeLink && (
                        <span
                          className="text-danger"
                          style={{
                            fontSize: "12px",
                          }}
                        >
                          {errors?.youTubeLink}
                        </span>
                      )}
                    </Label>
                  </div>
                  <div className="input-container">
                    <Input
                      type="text"
                      className="form-control"
                      id="YouTube-channelLink"
                      placeholder="YouTube Social Media Link"
                      name="youTubeLink"
                      value={inputValue?.youTubeLink}
                      onChange={handleOnChange}
                    />
                    {slugId && inputValue?.youTubeLink && (
                      <>
                        <span className="vertical-line"></span>

                        <a
                          href={inputValue?.youTubeLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="icon-link"
                        >
                          <i class="ri-links-line"></i>{" "}
                        </a>
                      </>
                    )}
                  </div>
                </div>
                <div className="mb-3">
                  {" "}
                  <div>
                    <Label className="form-label" htmlFor="instagramLink">
                      Instagram Social Media Link{" "}
                      {errors?.instagramLink && (
                        <span
                          className="text-danger"
                          style={{
                            fontSize: "12px",
                          }}
                        >
                          {errors?.instagramLink}
                        </span>
                      )}
                    </Label>
                  </div>
                  <div className="input-container">
                    <Input
                      type="text"
                      className="form-control"
                      id="instagramLink"
                      placeholder="Instagram Social Media Link"
                      name="instagramLink"
                      value={inputValue?.instagramLink}
                      onChange={handleOnChange}
                    />
                    {slugId && inputValue?.instagramLink && (
                      <>
                        <span className="vertical-line"></span>

                        <a
                          href={inputValue?.instagramLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="icon-link"
                        >
                          <i class="ri-links-line"></i>{" "}
                        </a>
                      </>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <div>
                    <Label className="form-label" htmlFor="facebookLink">
                      Facebook Social Media Link{" "}
                      {errors?.facebookLink && (
                        <span
                          className="text-danger"
                          style={{
                            fontSize: "12px",
                          }}
                        >
                          {errors?.facebookLink}
                        </span>
                      )}
                    </Label>
                  </div>
                  <div className="input-container">
                    <Input
                      type="text"
                      className="form-control"
                      id="facebookLink"
                      placeholder="Facebook Social Media Link"
                      name="facebookLink"
                      value={inputValue?.facebookLink}
                      onChange={handleOnChange}
                    />
                    {slugId && inputValue?.facebookLink && (
                      <>
                        <span className="vertical-line"></span>

                        <a
                          href={inputValue?.facebookLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="icon-link"
                        >
                          <i class="ri-links-line"></i>{" "}
                        </a>
                      </>
                    )}
                  </div>
                </div>
                <div className="mb-3">
                  {" "}
                  <div>
                    <Label className="form-label" htmlFor="twitterLink">
                      Twitter Social Media Link{" "}
                      {errors?.twitterLink && (
                        <span
                          className="text-danger"
                          style={{
                            fontSize: "12px",
                          }}
                        >
                          {errors?.twitterLink}
                        </span>
                      )}
                    </Label>
                  </div>
                  <div className="input-container">
                    <Input
                      type="text"
                      className="form-control"
                      id="twitterLink"
                      placeholder="Twitter Social Media Link"
                      name="twitterLink"
                      value={inputValue?.twitterLink}
                      onChange={handleOnChange}
                    />
                    {slugId && inputValue?.twitterLink && (
                      <>
                        <span className="vertical-line"></span>

                        <a
                          href={inputValue?.twitterLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="icon-link"
                        >
                          <i class="ri-links-line"></i>{" "}
                        </a>
                      </>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <div>
                    <Label className="form-label" htmlFor="linkedInLink">
                      Linkdin Social Media Link{" "}
                      {errors?.linkedInLink && (
                        <span
                          className="text-danger"
                          style={{
                            fontSize: "12px",
                          }}
                        >
                          {errors?.linkedInLink}
                        </span>
                      )}
                    </Label>
                  </div>
                  <div className="input-container">
                    <Input
                      type="text"
                      className="form-control"
                      id="linkedInLink"
                      placeholder="Linkdin Social Media Link"
                      name="linkedInLink"
                      value={inputValue?.linkedInLink}
                      onChange={handleOnChange}
                    />
                    {slugId && inputValue?.linkedInLink && (
                      <>
                        <span className="vertical-line"></span>

                        <a
                          href={inputValue?.linkedInLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="icon-link"
                        >
                          <i class="ri-links-line"></i>{" "}
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
      <CommonModal
        body={
          <div className="mt-2 text-start">
            <Label>Reason</Label>
            <textarea
              className="form-control"
              id="meta-description-input"
              placeholder="Enter Reason..."
              name="meta_description"
              rows="5"
              value={inputValue?.reason}
              onChange={(e) => {
                setInputValue({
                  ...inputValue,
                  reason: e?.target?.value?.trimStart(),
                });
              }}
            ></textarea>
          </div>
        }
        isOpen={isOpenModal}
        onSubmit={() => {
          setIsOpenModal(false);
        }}
        onCloseClick={() => {
          setIsOpenModal(false);
        }}
        isDisabled={!inputValue?.reason}
        buttonText="Submit"
        header="Status"
      />
    </div>
  );
};

export default CreateGpt;
