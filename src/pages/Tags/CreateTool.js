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
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { registerPlugin } from "react-filepond";
import Select from "react-select";
import "filepond/dist/filepond.min.css";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import {
  BUTTON_LIST,
  CREATE_TOOL_VALUE,
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


// Register the plugins
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

const CreateTool = (props) => {
  const [enteredValues, setEnteredValues] = useState([]);
  const [inputValue, setInputValue] = useState({});
  const [isOpenModal, setIsOpenModal] = useState(false);
  const { toolLoader, toolData } = useSelector((state) => state.Tool);
  const [toolSubCategoryData, setToolSubCategoryData] = useState([]);
  const [customActiveTab, setcustomActiveTab] = useState(1);
  const toggleCustom = (tab) => {
    if (customActiveTab !== tab) {
      setcustomActiveTab(tab);
    }
  };
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const { slugId } = useParams();
  const { pathname } = useLocation();
  document.title = `${slugId ? "Update" : "Create"}  Tool | Augmation Tech`;

  useEffect(() => {
    const params = {};
    params.page = 1;
    params.limit = 130;
    params.status = "active";
    dispatch(
      getTagGroupList({
        ...params,
      })
    )
      .then((res) => {
        if (res?.payload?.success) {
          const data = res?.payload?.payload?.aiToolSubCategory?.map((item) => {
            return {
              value: item?._id,
              label: item?.name,
            };
          });
          setToolSubCategoryData(data);
        }
      })
      .catch(() => {});
    setErrors({});
    if (slugId) {
      handleGetToolData();
    } else {
      setInputValue(CREATE_TOOL_VALUE);
      setErrors({});
      setEnteredValues([]);
    }
  }, [pathname, slugId]);

  const handleGetToolData = () => {
    const params = {};
    params.slugId = slugId;
    params.page = 1;
    if (!slugId) {
      params.createdBy = "admin";
    }
    params.limit = 10;
    if (slugId) {
      dispatch(
        getTools({
          ...params,
        })
      ).then((res) => {
        const data = res?.payload?.payload?.aiTool[0];
        if (res?.payload?.success) {
          const val = {
            toolLogo: data?.icon || "",
            toolWebsiteImage: data?.images[0] || "",
            toolLogoFile: data?.icon || "",
            toolWebsiteImageFile: data?.images[0] || "",
            name: data?.title || "",
            websiteUrl: data?.websiteLink || "",
            category: data?.aiToolSubCategory[0]?._id || null,
            relatedCategory: data?.related_subcategory || [],
            couponDeals: data?.couponDeals || "",
            paidPlanDeals: data?.planDeals || "",
            description: data?.details || "",
            pros: data?.pros || "",
            cons: data?.cons || "",
            isLive: data?.isLive || false,
            isVerified: data?.isVerified || false,
            isAffiliate: data?.isAffiliate || false,
            pricing: data?.pricing[0] || "",
            shortDescription: data?.description || "",
            YouTubeChannelLink: data?.youTubeChannelLink || "",
            InstagramChannelLink: data?.instagramChannelLink || "",
            FacebookChannelLink: data?.facebookChannelLink || "",
            TwitterChannelLink: data?.twitterChannelLink || "",
            LinkdinChannelLink: data?.linkedInChannelLink || "",
            feature: data?.features || [],
            status: data?.status || "Approved",
            oldStatus: data?.status || "Approved",
          };
          setInputValue(val);
          setEnteredValues(data?.metaKeyword || []);
        }
      });
    }
  };

  const validateField = (fieldName, value) => {
    let error = null;

    switch (fieldName) {
      case "name":
        if (!value) error = "Tool Name is required";
        break;
      case "toolLogo":
        if (!value) error = "Tool logo is required";
        break;
      case "toolWebsiteImage":
        if (!value) error = "Tool website image is required";
        break;
      case "websiteUrl":
        if (!value) error = "Website URL is required";
        else if (!WEBSITE_URL?.test(value)) error = "Website URL is not valid";
        break;
      case "YouTubeChannelLink":
      case "InstagramChannelLink":
      case "FacebookChannelLink":
      case "TwitterChannelLink":
      case "LinkdinChannelLink":
        if (value && !WEBSITE_URL?.test(value)) error = "URL is not valid";
        break;

      case "category":
        if (!value) error = "Category is required";
        break;
      case "description":
        if (!value) error = "Description is required";
        break;
      case "pricing":
        if (!value) error = "Pricing is required";
        break;
      case "shortDescription":
        if (!value) error = "Short Description is required";
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
      "name",
      "toolLogo",
      "toolWebsiteImage",
      "websiteUrl",
      "category",
      "description",
      "pricing",
      "shortDescription",
      "YouTubeChannelLink",
      "InstagramChannelLink",
      "FacebookChannelLink",
      "TwitterChannelLink",
      "LinkdinChannelLink",
    ];

    fieldsToValidate?.forEach((field) => {
      const error = validateField(field, inputValue[field]);
      if (error) {
        newErrors[field] = error;
      }
    });
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;

    if (isValid) {
      if (
        pathname?.startsWith("/update-user-tool") &&
        inputValue?.status?.toLowerCase() == "rejected" &&
        !inputValue?.reason
      ) {
        setIsOpenModal(true);
        return;
      }
      const formdata = new FormData();

      formdata.append("pricing[]", [inputValue?.pricing]);
      formdata.append("title", inputValue?.name);
      formdata.append("pros", inputValue?.pros);
      formdata.append("cons", inputValue?.cons);
      formdata.append("description", inputValue?.shortDescription);
      formdata.append("details", inputValue?.description);
      formdata.append("isLive", inputValue?.isLive);
      formdata.append("isVerified", inputValue?.isVerified);
      formdata.append("isAffiliate", inputValue?.isAffiliate);
      formdata.append("aiToolSubCategoryId", inputValue?.category);
      formdata.append("websiteLink", inputValue?.websiteUrl);
      if (inputValue.couponDeals) {
        formdata.append("couponDeals", inputValue.couponDeals);
      }
      if (inputValue.InstagramChannelLink) {
        formdata.append(
          "instagramChannelLink",
          inputValue.InstagramChannelLink
        );
      }
      if (inputValue.LinkdinChannelLink) {
        formdata.append("linkedInChannelLink", inputValue.LinkdinChannelLink);
      }
      if (inputValue.FacebookChannelLink) {
        formdata.append("facebookChannelLink", inputValue.FacebookChannelLink);
      }
      if (inputValue.TwitterChannelLink) {
        formdata.append("twitterChannelLink", inputValue.TwitterChannelLink);
      }
      if (inputValue.YouTubeChannelLink) {
        formdata.append("youTubeChannelLink", inputValue.YouTubeChannelLink);
      }
      if (inputValue?.paidPlanDeals) {
        formdata.append("planDeals", inputValue?.paidPlanDeals);
      }
      if (inputValue?.reason) {
        formdata.append("reject_reason", inputValue?.reason);
      }
      formdata.append("icon", inputValue?.toolLogoFile);

      formdata.append("images", inputValue?.toolWebsiteImageFile);

      Object.keys(inputValue)?.forEach((key) => {
        if (key === "feature") {
          inputValue[key]?.map((item) => {
            return formdata.append("features[]", [item]);
          });
        }
        if (key === "relatedCategory") {
          inputValue[key]?.map((item) => {
            return formdata.append("related_subcategory[]", [item]);
          });
        }
      });
      formdata.append("status", inputValue?.status?.toLowerCase());

      if (!slugId) {
        dispatch(createAiTool({ body: formdata }))
          .then((res) => {
            if (res?.payload?.success) {
              toast.success("AI tools submitted successfully");
              navigate("/admin-tool");
              setEnteredValues([]);
              setInputValue(CREATE_TOOL_VALUE);
              setErrors({});
            } else {
              toast.error(res?.payload?.data?.message);
            }
          })
          .catch((err) => {});
      } else {
        // dispatch(updateAiTool({ body: formdata, id: toolData[0]?._id }))
        //   .then((res) => {
        //     if (res?.payload?.success) {
        //       toast.success("AI tools updated successfully");
        //       if (pathname?.startsWith("/update-admin-tool")) {
        //         navigate("/admin-tool");
        //       } else {
        //         navigate("/users-tool");
        //       }
        //     } else {
        //       toast.error(res?.payload?.data?.message);
        //     }
        //   })
        //   .catch((err) => {});
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
  const handleCheckboxChange = (e) => {
    const { id, checked } = e.target;
    let value;
    if (checked) {
      value = [...inputValue?.feature, id];
    } else {
      value = inputValue?.feature?.filter((item) => item !== id);
    }
    setInputValue((prevValues) => ({
      ...prevValues,
      feature: value,
    }));
  };
  const handleRadioChange = (e) => {
    const { id } = e.target;
    setInputValue(() => ({
      ...inputValue,
      pricing: id,
    }));
    setErrors({
      ...errors,
      pricing: id ? "" : "Pricing is required",
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

  const handleDescription = ( editor) => {
    const data = editor
    setInputValue({
      ...inputValue,
      description: data?.trimStart(),
    });
    setErrors({
      ...errors,
      description: data?.trimStart() ? "" : "Description is required",
    });
  };
  return (
    <div className="page-content">
      {toolLoader && <Loader />}
      <Container fluid>
        <BreadCrumb
          title={`${slugId ? "Update" : "Create"} Tool`}
          pageTitle="Tool"
        />
        <div className="text-end mb-3">
          <Button
            type="submit"
            className="btn btn-success w-sm me-2"
            onClick={(e) => (toolLoader ? {} : handleSubmit(e))}
            disabled={toolLoader}
          >
            Submit
          </Button>
          {slugId && (
            <Button
              type="button"
              className="btn btn-primary w-sm"
              onClick={() => {
                pathname?.startsWith("/update-admin-tool")
                  ? navigate("/admin-tool")
                  : navigate("/users-tool");
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
                <h5 className="card-title mb-0">Tool Gallery</h5>
              </CardHeader>
              <CardBody>
                <div className="container">
                  <div className="row">
                    <div className="col-12 col-sm-6">
                      <h5 className="fs-14 mb-4">
                        Tool logo <span className="text-danger">*</span>
                        {errors?.toolLogo && (
                          <span
                            className="text-danger"
                            style={{
                              fontSize: "12px",
                            }}
                          >
                            {errors?.toolLogo}
                          </span>
                        )}
                      </h5>
                      <div className="text-center">
                        <div className="position-relative d-inline-block">
                          <div className="position-absolute top-100 start-100 translate-middle">
                            {!inputValue?.toolLogo ? (
                              <label
                                htmlFor="tool-logo-input"
                                className="mb-0"
                                data-bs-toggle="tooltip"
                                data-bs-placement="right"
                                title={
                                  inputValue?.toolLogo
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
                                onClick={() => handleImageDelete("toolLogo")}
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
                              name="toolLogo"
                              accept="image/png, image/gif, image/jpeg"
                              onChange={(e) => handleImageChange(e)}
                            />
                          </div>

                          <div className="avatar-lg">
                            <div className="avatar-title bg-light rounded">
                              {inputValue?.toolLogo && (
                                <img
                                  src={inputValue?.toolLogo}
                                  id="tool-logo-img"
                                  alt=""
                                  className="avatar-md h-100 w-100 rounded"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-sm-6">
                      <h5 className="fs-14 mb-4">
                        Tool Website Image{" "}
                        <span className="text-danger">*</span>
                        {errors?.toolWebsiteImage && (
                          <span
                            className="text-danger"
                            style={{
                              fontSize: "12px",
                            }}
                          >
                            {errors?.toolWebsiteImage}
                          </span>
                        )}
                      </h5>
                      <div className="text-center">
                        <div className="position-relative d-inline-block">
                          <div className="position-absolute top-100 start-100 translate-middle">
                            {!inputValue?.toolWebsiteImage ? (
                              <label
                                htmlFor="tool-website-image-input"
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
                                onClick={() =>
                                  handleImageDelete("toolWebsiteImage")
                                }
                              >
                                <div className="avatar-title bg-light border rounded-circle text-muted cursor-pointer">
                                  <i className="ri-delete-bin-6-line"></i>
                                </div>
                              </div>
                            )}
                            <input
                              className="form-control d-none"
                              defaultValue=""
                              id="tool-website-image-input"
                              type="file"
                              name="toolWebsiteImage"
                              accept="image/png, image/gif, image/jpeg"
                              onChange={(e) => handleImageChange(e)}
                            />
                          </div>
                          <div className="avatar-lg" style={{ width: "200px" }}>
                            <div className="avatar-title bg-light rounded">
                              {inputValue?.toolWebsiteImage && (
                                <img
                                  src={inputValue?.toolWebsiteImage}
                                  id="tool-website-img"
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
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <div className="mb-3 row">
                  <div className="col-12 col-sm-6 ">
                    <Label className="form-label" htmlFor="tool-name">
                      Tool Name <span className="text-danger">*</span>{" "}
                      {errors?.name && (
                        <span
                          className="text-danger"
                          style={{
                            fontSize: "12px",
                          }}
                        >
                          {errors?.name}
                        </span>
                      )}
                    </Label>
                    <Input
                      type="text"
                      className="form-control"
                      id="tool-name"
                      placeholder="Enter tool name"
                      name="name"
                      value={inputValue?.name}
                      onChange={handleOnChange}
                    />
                  </div>
                  <div className="col-12 col-sm-6 mt-3 mt-md-0">
                    {" "}
                    <div>
                      <Label className="form-label" htmlFor="website-url">
                        Website URL <span className="text-danger">*</span>{" "}
                        {errors?.websiteUrl && (
                          <span
                            className="text-danger"
                            style={{
                              fontSize: "12px",
                            }}
                          >
                            {errors?.websiteUrl}
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
                        name="websiteUrl"
                        value={inputValue?.websiteUrl}
                        onChange={handleOnChange}
                      />
                      {slugId && inputValue?.websiteUrl && (
                        <>
                          <span className="vertical-line"></span>

                          <a
                            href={inputValue?.websiteUrl}
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
                    <Label className="form-label" htmlFor="category">
                      Category <span className="text-danger">*</span>{" "}
                      {errors?.category && (
                        <span
                          className="text-danger"
                          style={{
                            fontSize: "12px",
                          }}
                        >
                          {errors?.category}
                        </span>
                      )}
                    </Label>
                    <Select
                      id="category"
                      value={
                        inputValue?.category
                          ? toolSubCategoryData?.find(
                              (item) => item?.value == inputValue?.category
                            )
                          : ""
                      }
                      onChange={(e) => {
                        setInputValue({
                          ...inputValue,
                          category: e?.value,
                        });
                        setErrors({
                          ...errors,
                          category: e?.value ? "" : "Category is required",
                        });
                      }}
                      placeholder="Select category"
                      options={toolSubCategoryData}
                      styles={singleSelectStyle}
                    />
                  </div>{" "}
                  <div className="col-12 col-sm-6 mt-3 mt-md-0">
                    <Label htmlFor="related-category" className="form-label">
                      Related category
                    </Label>
                    <Select
                      id="related-category"
                      value={
                        inputValue?.relatedCategory?.length
                          ? toolSubCategoryData?.filter((item, i) =>
                              inputValue?.relatedCategory?.some(
                                (val) => item?.value == val
                              )
                            )
                          : ""
                      }
                      isMulti={true}
                      placeholder="Select related category"
                      onChange={(data) => {
                        if (data && data?.length <= 10) {
                          setInputValue({
                            ...inputValue,
                            relatedCategory: data?.map((item) => item.value),
                          });
                        }
                      }}
                      options={toolSubCategoryData}
                      closeMenuOnSelect={false}
                      styles={multiSelectStyle}
                    />
                  </div>
                </div>
                <div className="mb-3 row">
                  <div className="col-12 col-sm-6">
                    <Label className="form-label" htmlFor="coupon-deals">
                      Coupon Deals
                    </Label>
                    <Input
                      type="text"
                      className="form-control"
                      id="coupon-deals"
                      placeholder="Enter coupon deals"
                      name="couponDeals"
                      value={inputValue?.couponDeals}
                      onChange={handleOnChange}
                    />
                  </div>{" "}
                  <div className="col-12 col-sm-6 mt-3 mt-md-0">
                    <Label className="form-label" htmlFor="paidPlanDeals">
                      Paid Plan deals
                    </Label>
                    <Input
                      type="text"
                      className="form-control"
                      id="paidPlanDeals"
                      placeholder="Enter paid plan deals"
                      name="paidPlanDeals"
                      value={inputValue?.paidPlanDeals}
                      onChange={handleOnChange}
                    />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="mb-2">
                  <Label>
                    Tool Description <span className="text-danger">*</span>{" "}
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
                <div className="row">
                  <div className="col-12 col-sm-6">
                    <Label>Pros</Label>
                    <div className="proseditor-container">
                     
                    </div>
                  </div>
                  <div className="col-12 col-sm-6">
                    <Label>Cons</Label>
                    <div className="proseditor-container">
                     
                    
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col lg={4}>
            <Card>
              <CardHeader>
                <h5 className="card-title mb-0">Publish</h5>
              </CardHeader>
              <CardBody>
                <div className="row gy-2">
                  <div className="col-4 p-0 ps-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="isLive"
                      checked={inputValue?.isLive}
                      onChange={(e) => {
                        setInputValue({
                          ...inputValue,
                          isLive: e?.target?.checked,
                        });
                      }}
                    />
                    <label className="form-check-label ms-2" htmlFor="isLive">
                      Is Live
                    </label>
                  </div>
                  <div className="col-4 p-0 ps-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="isVerified"
                      checked={inputValue?.isVerified}
                      onChange={(e) => {
                        setInputValue({
                          ...inputValue,
                          isVerified: e?.target?.checked,
                        });
                      }}
                    />
                    <label
                      className="form-check-label ms-2"
                      htmlFor="isVerified"
                    >
                      Is Verified
                    </label>
                  </div>
                  <div className="col-4 p-0 ps-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="isAffiliate"
                      checked={inputValue.isAffiliate}
                      onChange={(e) => {
                        setInputValue({
                          ...inputValue,
                          isAffiliate: e?.target?.checked,
                        });
                      }}
                    />
                    <label
                      className="form-check-label ms-2"
                      htmlFor="isAffiliate"
                    >
                      Is Affiliate
                    </label>
                  </div>
                </div>
              </CardBody>
            </Card>
            {pathname?.startsWith("/update-user-tool") && (
              <Card>
                <CardHeader>
                  <h5 className="card-title mb-0">Status</h5>
                </CardHeader>
                <CardBody>
                  <div className="row">
                    {["Pending", "Approved", "Rejected"].map((statusOption) => (
                      <div key={statusOption} className="col-4 p-0 ps-2">
                        <input
                          className="form-check-input"
                          type="radio"
                          id={statusOption}
                          checked={
                            inputValue?.status?.toLowerCase() ===
                            statusOption?.toLowerCase()
                          }
                          onChange={(e) => {
                            setInputValue(() => ({
                              ...inputValue,
                              status: e?.target?.id,
                            }));
                          }}
                        />
                        <label
                          className="form-check-label ms-2"
                          htmlFor={statusOption}
                        >
                          {statusOption}
                        </label>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}

            <Card>
              <CardHeader>
                <h5 className="card-title mb-0">
                  Pricing <span className="text-danger">*</span>{" "}
                  {errors?.pricing && (
                    <span
                      className="text-danger"
                      style={{
                        fontSize: "12px",
                      }}
                    >
                      {errors?.pricing}
                    </span>
                  )}
                </h5>
              </CardHeader>
              <CardBody>
                <div className="row gy-2">
                  {[
                    "Free",
                    "Freemium",
                    "Free Trial",
                    "Paid",
                    "Contact for Pricing",
                    "Deals",
                  ].map((pricingOption) => (
                    <div key={pricingOption} className="col-6 p-0 ps-2">
                      <input
                        className="form-check-input"
                        type="radio"
                        id={pricingOption}
                        checked={inputValue?.pricing === pricingOption}
                        onChange={handleRadioChange}
                      />
                      <label
                        className="form-check-label ms-2"
                        htmlFor={pricingOption}
                      >
                        {pricingOption}
                      </label>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h5 className="card-title mb-0">Features</h5>
              </CardHeader>
              <CardBody>
                <div className="row gy-2">
                  {[
                    { id: "Waitlist", label: "Waitlist" },
                    { id: "Open Source", label: "Open Source" },
                    { id: "Mobile App", label: "Mobile App" },
                    { id: "Discord Community", label: "Discord Community" },
                    { id: "API", label: "API" },
                    { id: "No Signup Required", label: "No Signup Required" },
                    { id: "Browser Extension", label: "Browser Extension" },
                  ].map((feature) => (
                    <div key={feature.id} className="col-6 p-0 ps-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={feature.id}
                        defaultChecked={inputValue?.feature?.includes(
                          feature.id
                        )}
                        checked={inputValue?.feature?.includes(feature.id)}
                        onChange={handleCheckboxChange}
                      />
                      <label
                        className="form-check-label ms-2"
                        htmlFor={feature.id}
                      >
                        {feature.label}
                      </label>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h5 className="card-title mb-0">
                  Short Description <span className="text-danger">*</span>{" "}
                  {errors?.shortDescription && (
                    <span
                      className="text-danger"
                      style={{
                        fontSize: "12px",
                      }}
                    >
                      {errors?.shortDescription}
                    </span>
                  )}
                </h5>
              </CardHeader>
              <CardBody>
                <textarea
                  className="form-control"
                  rows="11"
                  value={inputValue?.shortDescription}
                  name="shortDescription"
                  onChange={handleOnChange}
                  placeholder="Write a short description of your tool"
                ></textarea>
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
                      {errors?.YouTubeChannelLink && (
                        <span
                          className="text-danger"
                          style={{
                            fontSize: "12px",
                          }}
                        >
                          {errors?.YouTubeChannelLink}
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
                      name="YouTubeChannelLink"
                      value={inputValue?.YouTubeChannelLink}
                      onChange={handleOnChange}
                    />
                    {slugId && inputValue?.YouTubeChannelLink && (
                      <>
                        <span className="vertical-line"></span>

                        <a
                          href={inputValue?.YouTubeChannelLink}
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
                    <Label
                      className="form-label"
                      htmlFor="InstagramChannelLink"
                    >
                      Instagram Social Media Link{" "}
                      {errors?.InstagramChannelLink && (
                        <span
                          className="text-danger"
                          style={{
                            fontSize: "12px",
                          }}
                        >
                          {errors?.InstagramChannelLink}
                        </span>
                      )}
                    </Label>
                  </div>
                  <div className="input-container">
                    <Input
                      type="text"
                      className="form-control"
                      id="InstagramChannelLink"
                      placeholder="Instagram Social Media Link"
                      name="InstagramChannelLink"
                      value={inputValue?.InstagramChannelLink}
                      onChange={handleOnChange}
                    />
                    {slugId && inputValue?.InstagramChannelLink && (
                      <>
                        <span className="vertical-line"></span>

                        <a
                          href={inputValue?.InstagramChannelLink}
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
                    <Label className="form-label" htmlFor="FacebookChannelLink">
                      Facebook Social Media Link{" "}
                      {errors?.FacebookChannelLink && (
                        <span
                          className="text-danger"
                          style={{
                            fontSize: "12px",
                          }}
                        >
                          {errors?.FacebookChannelLink}
                        </span>
                      )}
                    </Label>
                  </div>
                  <div className="input-container">
                    <Input
                      type="text"
                      className="form-control"
                      id="FacebookChannelLink"
                      placeholder="Facebook Social Media Link"
                      name="FacebookChannelLink"
                      value={inputValue?.FacebookChannelLink}
                      onChange={handleOnChange}
                    />{" "}
                    {slugId && inputValue?.FacebookChannelLink && (
                      <>
                        <span className="vertical-line"></span>

                        <a
                          href={inputValue?.FacebookChannelLink}
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
                    <Label className="form-label" htmlFor="TwitterChannelLink">
                      Twitter Social Media Link{" "}
                      {errors?.TwitterChannelLink && (
                        <span
                          className="text-danger"
                          style={{
                            fontSize: "12px",
                          }}
                        >
                          {errors?.TwitterChannelLink}
                        </span>
                      )}
                    </Label>
                  </div>
                  <div className="input-container">
                    <Input
                      type="text"
                      className="form-control"
                      id="TwitterChannelLink"
                      placeholder="Twitter Social Media Link"
                      name="TwitterChannelLink"
                      value={inputValue?.TwitterChannelLink}
                      onChange={handleOnChange}
                    />
                    {slugId && inputValue?.TwitterChannelLink && (
                      <>
                        <span className="vertical-line"></span>

                        <a
                          href={inputValue?.TwitterChannelLink}
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
                    <Label className="form-label" htmlFor="LinkdinChannelLink">
                      Linkdin Social Media Link{" "}
                      {errors?.LinkdinChannelLink && (
                        <span
                          className="text-danger"
                          style={{
                            fontSize: "12px",
                          }}
                        >
                          {errors?.LinkdinChannelLink}
                        </span>
                      )}
                    </Label>
                  </div>
                  <div className="input-container">
                    <Input
                      type="text"
                      className="form-control"
                      id="LinkdinChannelLink"
                      placeholder="Linkdin Social Media Link"
                      name="LinkdinChannelLink"
                      value={inputValue?.LinkdinChannelLink}
                      onChange={handleOnChange}
                    />
                    {slugId && inputValue?.LinkdinChannelLink && (
                      <>
                        <span className="vertical-line"></span>

                        <a
                          href={inputValue?.LinkdinChannelLink}
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
          setInputValue({
            ...inputValue,
            reason: "",
          });
        }}
        isDisabled={!inputValue?.reason}
        buttonText="Submit"
        header="Status"
      />
    </div>
  );
};

export default CreateTool;
