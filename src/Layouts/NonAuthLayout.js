import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import withRouter from "../Components/Common/withRouter";
import { useProfile } from "../Components/Hooks/UserHooks";

const NonAuthLayout = ({ children }) => {
  const { userProfile, token } = useProfile();
const pathname = useLocation()

  const { layoutModeType } = useSelector((state) => ({
    layoutModeType: state.Layout.layoutModeType,
  }));

  useEffect(() => {
    if (layoutModeType === "dark") {
      document.body.setAttribute("data-layout-mode", "dark");
    } else {
      document.body.setAttribute("data-layout-mode", "light");
    }
    return () => {
      document.body.removeAttribute("data-layout-mode");
    };
  }, [layoutModeType]);

  if (userProfile && pathname.pathname !== "/dashboard") {
    return <Navigate to="/dashboard" />;
  }

  return <div>{children}</div>;
};

export default withRouter(NonAuthLayout);
