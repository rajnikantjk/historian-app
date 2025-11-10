export const toolstatus = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

//---------regex---------//
export const WEBSITE_URL = /^(ftp|http|https):\/\/[^ "]+$/;

//-------custom style-------//

export const singleSelectStyle = {
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

export const multiSelectStyle = {
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
      ? "white"
      : "white",
    color: state.isSelected ? "white" : "black",
    "&:hover": {
      backgroundColor: state.isSelected ? "#405189" : "#e9ecef",
      color: state.isSelected ? "white" : "black",
    },
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: "#405189",
    color: "white",
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: "white",
  }),
  multiValueRemove: (provided) => ({
    ...provided,

    color: "white",
    "&:hover": {
      backgroundColor: "#283e68",
      color: "white",
    },
  }),
};

//------- default value-------//
export const CREATE_TOOL_VALUE = {
  toolLogo: "",
  toolWebsiteImage: "",
  name: "",
  websiteUrl: "",
  category: null,
  relatedCategory: [],
  couponDeals: "",
  paidPlanDeals: "",
  description: "",
  pros: "",
  cons: "",
  isLive: false,
  isVerified: false,
  isAffiliate: false,
  pricing: "",
  shortDescription: "",
  YouTubeChannelLink: "",
  InstagramChannelLink: "",
  FacebookChannelLink: "",
  TwitterChannelLink: "",
  LinkdinChannelLink: "",
  feature: [],
  status: "Approved",
  reason: "",
  metaKeyword: "",
  metaTitle: "",
  metaDescription: "",
  toolLogoFile: "",
  toolWebsiteImageFile: "",
};
export const CREATE_GPT_VALUE = {
  projectName: "",
  description: "",
  metaKeyword: "",
  categoryId: "",
  icon: "",
  authorName: "",
  websiteLink: "",
  instagramLink: "",
  linkedInLink: "",
  facebookLink: "",
  twitterLink: "",
  youTubeLink: "",
  promptStater: [],
  featuresAndFunctions: [],
  iconFile: "",
  status: "Approved",
};
export const BUTTON_LIST= [
                          ["undo", "redo"],
                          ["font", "fontSize", "formatBlock"],
                          [
                            "bold",
                            "underline",
                            "italic",
                            "strike",
                            "subscript",
                            "superscript",
                          ],
                          ["fontColor", "hiliteColor", "textStyle"],
                          ["removeFormat"],
                          "/", // Line break
                          ["outdent", "indent"],
                          ["align", "horizontalRule", "list", "lineHeight"],
                          [
                            "table",
                            "link",
                            "image",
                            "video",
                            "fullScreen",
                            "showBlocks",
                            "codeView",
                          ],
                          ["preview", "print"],
                          ["save"],
]