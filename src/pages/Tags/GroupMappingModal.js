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
import {
  AddGroupMapping,
  EditToolSubcategory,
  getMappedGroupList,
  getTagGroupList,
  getTaglist,
  UpdateGroupMapping,
} from "../../slices/tools";
import MultiValueInput from "../../Components/Common/MultiValueInput";
import { multiSelectStyle } from "../../helpers/constnt";

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
      ? "rgba(10, 179, 156)"
      : state.isFocused
        ? "rgba(10, 179, 156, 0.18)"
        : "white",
    color: state.isSelected ? "white" : "black",
    "&:hover": {
      backgroundColor: "rgba(10, 179, 156, 0.18)",
      color: "black",
    },
  }),
};
const GroupMappingModal = ({
  addModal,
  setAddModal,
  values,
  setValues,
  rowId,
  page,
}) => {
  const dispatch = useDispatch();
  const { toolCategoryData, toolSubCategoryData } = useSelector((state) => state.Tool);
  const [errors, setErrors] = useState({});
  const [loader, setLoader] = useState(false);
  const [enteredValues, setEnteredValues] = useState([]);
  const [inputValue, setInputValue] = useState({});

  const groupdata = toolSubCategoryData.map((item) => {
    return {
      value: item?.id,
      label: item?.grpName,
    };
  });

  const tagdata = toolCategoryData.map((item) => {
    return {
      value: item?.id,
      label: item?.tagName,
    };
  });
  useEffect(() => {
    if (rowId) {
      setTimeout(() => {
        const tagNames = values?.tagId.split(',');
        const matchedIds = tagdata
          .filter(tag => tagNames.includes(tag.label));

        setInputValue({ ...inputValue, tagId: matchedIds.map(tag => tag.value), tagName: matchedIds })
      }, 200)

    }
  }, [values]);

  useEffect(() => {
    dispatch(getTagGroupList())
    dispatch(getTaglist())
  }, [])

  const customComponents = {
    MultiValue: () => null,
    MultiValueRemove: () => null,
    ClearIndicator: () => null,
  };

  const formValidation = () => {
    let isFormValid = true;
    let newErrors = {};
    const requiredFields = ["name",];
    requiredFields.forEach((field) => {

      if (!values?.grpId?.value || values?.grpId?.value === "") {
        isFormValid = false;
        newErrors["grpId"] = "Please select group";
      }
      if (inputValue?.tagId?.length == 0 || !inputValue?.tagId) {
        isFormValid = false;
        newErrors["tagId"] = "Please select tag";
      }

    });
    setErrors(newErrors);
    return isFormValid;
  };

  const handleOnAddCategory = () => {
    if (formValidation()) {
      setLoader(true);
      let payload = {
        grpId: values?.grpId?.value,
        tagId: inputValue?.tagId
      }

      dispatch(
        AddGroupMapping(payload)
      )
        .then((res) => {
          if (res?.payload?.status == 200) {
            setAddModal(false);
            dispatch(getMappedGroupList());
            setLoader(false);
            toast.success("Group Mapping added successfully");
            setValues({});
          } else {
            setLoader(false);

            toast.error(res?.payload?.data?.message);
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
      let payload = {
        grpId: values?.grpId?.value,
        tagId: inputValue?.tagId
      }
      dispatch(
        UpdateGroupMapping(payload)
      )
        .then((res) => {
          if (res?.payload?.status == 200) {
            setAddModal(false);
            dispatch(getMappedGroupList());
            setLoader(false);
            toast.success("Group Mapping updated successfully");
            setValues({});
          } else {
            setLoader(false);

            toast.error(res?.payload?.data?.message);
          }
        })
        .catch((err) => {
          setLoader(false);
          toast.error(err.response.data.message);
        });
    }
  };

  const removeTag = (tagValue) => {
    let updatedID = inputValue?.tagId?.filter(
      (val) => val != tagValue
    )
    let updatedTagName = inputValue?.tagName?.filter(
      (val) => val?.value != tagValue
    )
    setInputValue({ ...inputValue, tagId: updatedID, tagName: updatedTagName })
  };

  const clearAll = () => {
    setInputValue({ ...inputValue, tagId: [], tagName: [] })
  }

  return (
    <div>
      <Modal isOpen={addModal} id="exampleModal" size="lg" style={{ maxWidth: "1200px", width: "100%" }} >
        <ModalHeader
          toggle={() => {
            setAddModal(false);
            setValues({});
            setErrors({});
          }}
        >
          {rowId ? "Edit Group Mapping" : "Add New Group Mapping"}{" "}
        </ModalHeader>
        <ModalBody style={{ width: "100%" }}>
          <form>

            <div style={{ display: "flex", gap: "20px" }}>
              <div style={{ width: "300px" }}>
                <Card>
                  <CardBody>
                    <TabPane id="addproduct-metadata" tabId="2">
                      <div >
                        <label
                          htmlFor="customer-name"
                          className="col-form-label"
                        >
                          Select Group : <span className="text-danger">*</span>
                          {errors?.grpId && (
                            <span className="text-danger">
                              {errors?.grpId}
                            </span>
                          )}
                        </label>
                        <Select
                          value={values?.grpId}
                          onChange={(e) => {
                            setValues({
                              ...values,
                              grpId: e,
                            });
                            setErrors({ ...errors, grpId: "" });
                          }}
                          options={groupdata}
                          styles={singleSelectStyle}
                          placeholder="Select Group"
                        />


                      </div>
                      <div className="mt-2">
                        <label
                          htmlFor="customer-name"
                          className="col-form-label"
                        >
                          Select Tags : <span className="text-danger">*</span>
                          {errors?.tagId && (
                            <span className="text-danger">
                              {errors?.tagId}
                            </span>
                          )}
                        </label>
                        <Select
                          id="tagId"
                          value={
                            inputValue?.tagId?.length
                              ? tagdata?.filter((item, i) =>
                                inputValue?.tagId?.some(
                                  (val) => item?.value == val
                                )
                              )
                              : ""
                          }
                          isMulti={true}
                          placeholder="Select related tag"
                          onChange={(data) => {
                            setInputValue({
                              ...inputValue,
                              tagId: data?.map((item) => item.value),
                              tagName: data
                            });

                          }}
                          options={tagdata}
                          closeMenuOnSelect={false}
                          styles={multiSelectStyle}
                          components={customComponents}
                        />
                      </div>
                    </TabPane>

                  </CardBody>

                </Card>
              </div>
              <div style={{ flex: 1 }}>
                <div>
                  <div className="d-flex justify-content-between">
                    <p>Selected Tag</p>
                    {inputValue?.tagName?.length > 0 && <span className="cursor-pointer" onClick={() => clearAll()}>Remove All</span>}
                  </div>
                  <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {inputValue?.tagName?.map((tag) => (
                      <div
                        key={tag.value}
                        style={{
                          background: "#f1f1f1",
                          borderRadius: "15px",
                          padding: "5px 10px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ marginRight: "8px" }}>{tag.label}</span>
                        <button
                          onClick={() => removeTag(tag.value)}
                          style={{
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            fontWeight: "bold",
                            fontSize: "20px"
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

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
              {rowId ? "Save Changes" : "Add "}
            </span>
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default GroupMappingModal;
