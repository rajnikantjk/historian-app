import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Navdata = () => {
  const history = useNavigate();
  const [isDashboard, setIsDashboard] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const [isInvoices, setIsInvoices] = useState(false);
  const [isEcommerce, setIsEcommerce] = useState(false);
  const [isTools, setIsTools] = useState(false);
  const [isCategoryTools, setIsCategoryTools] = useState(false);
  const [isToolsList, setIsToolsList] = useState(false);
  const [isGpts, setIsGpts] = useState(false);
  const [isGptCategory, setIsGptCategory] = useState(false);
  const [isNewsLatter, setIsNewsLatter] = useState(false); 
  const [iscurrentState, setIscurrentState] = useState("Dashboard");

  const updateIconSidebar = (e) => {
    if (e && e.target && e.target.getAttribute("subitems")) {
      const ul = document.getElementById("two-column-menu");
      const iconItems = ul.querySelectorAll(".nav-icon.active");
      let activeIconItems = [...iconItems];
      activeIconItems.forEach((item) => {
        item.classList.remove("active");
        const id = item.getAttribute("subitems");
        if (document.getElementById(id)) {
          document.getElementById(id).classList.remove("show");
        }
      });
    }
  };

  useEffect(() => {
    document.body.classList.remove("twocolumn-panel");
    if (iscurrentState !== "Dashboard") {
      setIsDashboard(false);
    }
    if (iscurrentState !== "User") {
      setIsUser(false);
    }
    if (iscurrentState !== "Invoices") {
      setIsInvoices(false);
    }
    if (iscurrentState !== "ecommerce") {
      setIsEcommerce(false);
    }
    if (iscurrentState !== "tools") {
      setIsTools(false);
    }
    if (iscurrentState !== "aicategory") {
      setIsCategoryTools(false);
    }
    if (iscurrentState !== "toollist") {
      setIsToolsList(false);
    }
    if (iscurrentState !== "gpts") {
      setIsGpts(false);
    }
    if (iscurrentState !== "gptcategory") {
      setIsGptCategory(false);
    }
  }, [
    iscurrentState,
    isDashboard,
    isUser,
    isInvoices,
    isEcommerce,
    isTools,
    isCategoryTools,
    isToolsList,
    isGpts,isGptCategory
  ]);


  const menuItems = [
    {
      label: "Menu",
      isHeader: true,
    },
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "ri-dashboard-2-line",
      link: "/dashboard",
      stateVariables: isDashboard,
      click: (e) => {
        e.preventDefault();
        setIsDashboard(!isDashboard);
        setIscurrentState("Dashboard");
        updateIconSidebar(e);
      },
    },
    // {
    //   id: "User",
    //   label: "User",
    //   icon: "ri-user-2-line",
    //   link: "/user",
    //   stateVariables: isUser,
    //   click: (e) => {
    //     e.preventDefault();
    //     setIsUser(!isUser);
    //     setIscurrentState("User");
    //     updateIconSidebar(e);
    //   },
    // },
    {
      label: "Tag Management",
      isHeader: true,
    },
    {
      id: "tag-list",
      label: "Tag List",
      icon: "ri-price-tag-3-line",
      link: "/tag-list",
    },
    {
      id: "tag-group-list",
      label: "Tag Group List",
      icon: "ri-list-check",
      link: "/tag-group-list",
    },
    {
      id: "tag-group-mapping",
      label: "Tag Group Mapping",
      icon: "ri-link",
      link: "/tag-group-mapping",
    },
    {
      label: "Trend Management",
      isHeader: true,
    },
    {
      id: "live-trend",
      label: "Live Trend",
      icon: "ri-line-chart-line",
      link: "/live-trend",
    },
    {
      id: "history-trend",
      label: "History Trend",
      icon: "ri-history-line",
      link: "/history-trend",
    },
    
    {
      id: "settings",
      label: "General Settings",
      icon: "ri-settings-3-line",
      link: "/settings",
    },
    
 
      
        // {
        //   id: "toollist",
        //   label: "Tools List",
        //   stateVariables: isToolsList,
        //   icon: "ri-apps-line",

        //   click: (e) => {
        //     e.preventDefault();
        //     setIsToolsList(!isToolsList);
        //     setIscurrentState("toollist");
        //     updateIconSidebar(e);
        //   },
        //   subItems: [
        
        //     {
        //       id: "admin-tools",
        //       label: "Admin Tools",
        //       link: "/admin-tool",
        //       parentId: "toollist",
        //     },
        //     {
        //       id: "user-tools",
        //       label: "User Tools",
        //       link: "/users-tool",
        //       parentId: "toollist",
        //     },    {
        //       id: "add-tool",
        //       label: "Add New AI Tool",
        //       link: "/create-tool",
        //       parentId: "toollist",
        //     },
        //   ],
        // },
    //     {
    //       label: "GPT Store",
    //       isHeader: true,
    //     }, {
    //       id: "gptcategory",
    //       label: "GPT Category",
    //       icon: "ri-git-merge-line",

    //       stateVariables: isGptCategory,
    //       click: (e) => {
    //         e.preventDefault();
    //         setIsGptCategory(!isGptCategory);
    //         setIscurrentState("gptcategory");
    //         updateIconSidebar(e);
    //       },
    //       subItems: [
    //       {
    //       id: "gpts-category",
    //       label: "Main Category",
    //       link: "/gpts-category",
    //       parentId: "gptcategory",
    //     },
    //     {
    //       id: "gpts-subcategory",
    //       label: "Sub Category",
    //       link: "/gpts-subcategory",
    //       parentId: "gptcategory",
    //     },
    //       ],
    //     },
    //     {
    //       id: "GPTs",
    //       label: "GPT Lists",
    //       icon: " ri-camera-lens-line",

    //          stateVariables: isGpts,
    //   click: (e) => {
    //     e.preventDefault();
    //     setIsGpts(!isGpts);
    //     setIscurrentState("gpts");
    //     updateIconSidebar(e);
    //       },
    //       subItems: [
       
    //     {
    //       id: "gpts-list",
    //       label: "GPT List",
    //       link: "/gpts",
    //       parentId: "GPTs",
    //     },   {
    //       id: "create-gpt",
    //       label: "Add New GPT's",
    //       link: "/create-gpt",
    //       parentId: "GPTs",
    //     },
    //   ],
    // },
    // {
    //   label: "Newsletter",
    //   isHeader: true,
    // },
    // {
    //   id: "newsLatter",
    //   label: "Newsletter",
    //   icon: "ri-mail-line",

    //   stateVariables: isNewsLatter,
    //   click: (e) => {
    //     e.preventDefault();
    //     setIsNewsLatter(!isNewsLatter);
    //     setIscurrentState("newsLatter");
    //     updateIconSidebar(e);
    //   },
    //   subItems: [
    //     {
    //       id: "newslatter",
    //       label: "Sent Newsletter",
    //       link: "/sent-newslatter",
    //       parentId: "newsLatter",
    //     },
    //     {
    //       id: "newslatter-list",
    //       label: "Newsletters list",
    //       link: "/newslatters-list",
    //       parentId: "newsLatter",
    //     },
    //   ],
    // },
    // {
    //   label: "Email",
    //   isHeader: true,
    // },
    // {
    //   id: "email",
    //   label: "Email",
    //   icon: "ri-mail-open-line",
    //   link: "/email",

    //   stateVariables: isGptCategory,
    //   click: (e) => {
    //     e.preventDefault();
    //     setIsGptCategory(!isGptCategory);
    //     setIscurrentState("email");
    //     updateIconSidebar(e);
    //   },
    // },
  ];
  return <React.Fragment>{menuItems}</React.Fragment>;
};
export default Navdata;
