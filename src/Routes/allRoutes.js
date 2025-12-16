import React from "react";
import { Navigate } from "react-router-dom";
import Login from "../pages/Authentication/Login";
import ForgetPasswordPage from "../pages/Authentication/ForgetPassword";
import Logout from "../pages/Authentication/Logout";
import Register from "../pages/Authentication/Register";

//Invoices
import InvoiceList from "../pages/Invoices/InvoiceList";
import InvoiceCreate from "../pages/Invoices/InvoiceCreate";
import InvoiceDetails from "../pages/Invoices/InvoiceDetails";
import EcommerceProductDetail from "../pages/Ecommerce/EcommerceProducts/EcommerceProductDetail";
import EcommerceAddProduct from "../pages/Ecommerce/EcommerceProducts/EcommerceAddProduct";
import Users from "../pages/Users/index";
import Tools from "../pages/Tags/index";
import NewsLatter from "../pages/NewsLatter/index";
import Settings from "../pages/Profile/Settings/Settings";
import CreateTool from "../pages/Tags/CreateTool";
import AdminTool from "../pages/Tags/AdminTool";
import UsersTool from "../pages/Tags/UsersTool";
import Gpts from "../pages/Gpts/index";
import GptCategory from "../pages/Gpts/GptCategory";
import CreateGpt from "../pages/Gpts/CreateGpt";
import GptSubCategory from "../pages/Gpts/GptSubCategory";
import EmailPage from "../pages/Email";
import CreateNewsLatter from "../pages/NewsLatter/cretaeNewsLatter";
import TagList from "../pages/Tags/TagList";
import TagGroupList from "../pages/Tags/TagGroupList";
import GroupMapping from "../pages/Tags/GroupMapping";
import Dashboard from "../pages/Dashboard";
import HistoryTrend from "../pages/Trends/HistoryTrend";
import LiveTrend from "../pages/Trends/LiveTrend";
import Setting from "../pages/Settings/Settings";
import Reports from "../pages/Reports/Reports";
import ScheduleConfig from "../pages/SchedulerConfiguration/ScheduleConfig";

const authProtectedRoutes = [
  { path: "/dashboard", component: <Dashboard /> },
  { path: "/email", component: <EmailPage /> },

  { path: "/user", component: <Users /> },
  { path: "/profile", component: <Settings /> },
  { path: "/create-tool", component: <CreateTool /> },
  { path: "/sent-newslatter", component: <CreateNewsLatter /> },
  { path: "/newslatters-list", component: <NewsLatter /> },
  { path: "/update-admin-tool/:slugId", component: <CreateTool /> },
  { path: "/update-user-tool/:slugId", component: <CreateTool /> },
  { path: "/users-tool", component: <UsersTool /> },
  { path: "/admin-tool", component: <AdminTool /> },
  { path: "/history-trend", component: <HistoryTrend /> },
  { path: "/live-trend", component: <LiveTrend /> },
  { path: "/settings", component: <Setting /> },
  { path: "/scheduler-configuration", component: <ScheduleConfig /> },
   { path: "/reports", component: <Reports /> },
  { path: "/tools", component: <Tools /> },
  { path: "/tag-list", component: <TagList /> },
  { path: "/tag-group-list", component: <TagGroupList /> },
  { path: "/tag-group-mapping", component: <GroupMapping /> },
  //gpt
  { path: "/gpts", component: <Gpts /> },
  { path: "/create-gpt", component: <CreateGpt /> },
  { path: "/update-gpt/:slugId", component: <CreateGpt /> },

  { path: "/gpts-category", component: <GptCategory /> },
  { path: "/gpts-subcategory", component: <GptSubCategory /> },

  //Invoices
  { path: "/apps-invoices-list", component: <InvoiceList /> },
  { path: "/apps-invoices-details", component: <InvoiceDetails /> },
  { path: "/apps-invoices-create", component: <InvoiceCreate /> },
  { path: "*", component: <Navigate to="/dashboard" /> },
  {
    path: "/apps-ecommerce-product-details",
    component: <EcommerceProductDetail />,
  },
  { path: "/apps-ecommerce-add-product", component: <EcommerceAddProduct /> },
];

const publicRoutes = [
  // Authentication Page
  { path: "/logout", component: <Logout /> },
  { path: "/login", component: <Login /> },
  { path: "/forgot-password", component: <ForgetPasswordPage /> },
  { path: "/register", component: <Register /> },
  //AuthenticationInner pages
];

export { authProtectedRoutes, publicRoutes };
