//Include Both Helper File with needed methods
import { getFirebaseBackend } from "../../../helpers/firebase_helper";
import {
  adminLogin,
} from "../../../helpers/fakebackend_helper";

import {
  loginSuccess,
  logoutUserSuccess,
  apiError,
  reset_login_flag,
} from "./reducer";
import { toast } from "react-toastify";
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const loginUser = (user, history) => async (dispatch) => {
  try {
    let response;

    response = adminLogin({
      userName: user?.userName,
      password: user?.password,
      // role: "2",
    });

    var data = await response;
    
    if (data) {
      const userdata = decodeJWT(data?.data?.data);
      sessionStorage.setItem(
        "authUser",
        JSON.stringify({fname:userdata?.sub,...userdata})
      );
      sessionStorage.setItem("UserToken", data?.data?.data);
      localStorage.setItem(
        "authUser",
      JSON.stringify({fname:userdata?.sub,...userdata})
      );
      localStorage.setItem("UserToken", data?.data?.data);
      dispatch(loginSuccess({fname:"Admin"}));
        history("/dashboard");
        toast.success("Login Successfully");
    }
  } catch (error) {
    toast.error(error?.response?.data?.message);

    dispatch(apiError(error?.response?.data?.message));
  }
};

export const logoutUser = () => async (dispatch) => {
  localStorage.clear();
  sessionStorage.clear();

  dispatch(logoutUserSuccess(true));
};

export const socialLogin = (type, history) => async (dispatch) => {
  try {
    let response;

    if (process.env.REACT_APP_DEFAULTAUTH === "firebase") {
      const fireBaseBackend = getFirebaseBackend();
      response = fireBaseBackend.socialLoginUser(type);
    }
    //  else {
    //   response = postSocialLogin(data);
    // }

    const socialdata = await response;
    if (socialdata) {
      sessionStorage.setItem("authUser", JSON.stringify(response));
      dispatch(loginSuccess(response));
      history("/dashboard");
    }
  } catch (error) {
    dispatch(apiError(error));
  }
};

export const resetLoginFlag = () => async (dispatch) => {
  try {
    const response = dispatch(reset_login_flag());
    return response;
  } catch (error) {
    dispatch(apiError(error));
  }
};
