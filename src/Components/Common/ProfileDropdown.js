import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "reactstrap";

//import images
import avatar1 from "../../assets/images/users/avatar-1.jpg";
import { logoutUserSuccess } from "../../slices/auth/login/reducer";
import { toast } from "react-toastify";

const ProfileDropdown = () => {
  const history = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => ({
    user: state.Profile.user,
  }));

  const [userName, setUserName] = useState("Admin");

  useEffect(() => {
    if (localStorage.getItem("authUser")) {
      const obj = JSON.parse(localStorage.getItem("authUser"));
      const name = obj?.fname || "";
      setUserName(name.charAt(0).toUpperCase() + name.slice(1).toLowerCase());
    }
  }, [userName, user]);

  //Dropdown Toggle
  const [isProfileDropdown, setIsProfileDropdown] = useState(false);
  const toggleProfileDropdown = () => {
    setIsProfileDropdown(!isProfileDropdown);
  };
  const logoutUser = () => {
    localStorage.clear();
    sessionStorage.clear();
    history("/login");
     dispatch(logoutUserSuccess(true));
     toast.success("Logout Successfully");
  };

  return (
    <React.Fragment>
      <Dropdown
        isOpen={isProfileDropdown}
        toggle={toggleProfileDropdown}
        className="ms-sm-3 header-item topbar-user"
      >
        <DropdownToggle tag="button" type="button" className="btn">
          <span className="d-flex align-items-center">
            {/* <img
              className="rounded-circle header-profile-user"
              src={avatar1}
              alt="Header Avatar"
            /> */}
                <div className="avatar-title bg-soft-success text-success rounded-circle fs-53rounded-circle header-profile-user "style={{width:"32px", height:"32px" , fontSize:"15px"}}>
                {userName
                  .charAt(0)
                  .split(" ")
                  .slice(-1)
                  .toString()
                  .charAt(0)}
              </div>
            <span className="text-start ms-xl-2">
              <span className="d-none d-xl-inline-block ms-1 fw-medium user-name-text">
                {userName}
              </span>
            </span>
          </span>
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-end">
          <h6 className="dropdown-header">Welcome {userName}!</h6>
          {/* <DropdownItem className="p-0">
            <Link
              to={process.env.PUBLIC_URL + "/profile"}
              className="dropdown-item"
            >
              <i className="mdi mdi-account-circle text-muted fs-16 align-middle me-1"></i>
              <span className="align-middle">Profile</span>
            </Link>
          </DropdownItem> */}
          <DropdownItem className="p-0" onClick={() => logoutUser()}>
            <Link to={"#"} className="dropdown-item">
              <i className="mdi mdi-logout text-muted fs-16 align-middle me-1"></i>{" "}
              <span className="align-middle" data-key="t-logout">
                Logout
              </span>
            </Link>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </React.Fragment>
  );
};

export default ProfileDropdown;
