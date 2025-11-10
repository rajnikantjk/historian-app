import { combineReducers } from "redux";

// Front
import LayoutReducer from "./layouts/reducer";

// Authentication
import LoginReducer from "./auth/login/reducer";
import AccountReducer from "./auth/register/reducer";
import ForgetPasswordReducer from "./auth/forgetpwd/reducer";
import ProfileReducer from "./auth/profile/reducer";
//Invoice
import UsersReducers from "./user/index";
import ToolReducer from "./tools/index";
import NewsLatterReducer from "./newsLatter/index";
import GptReduces from "./gpts/index";

import DashboardReducer from "./dashboard/index";


const rootReducer = combineReducers({
  Layout: LayoutReducer,
  Login: LoginReducer,
  Account: AccountReducer,
  ForgetPassword: ForgetPasswordReducer,
  Profile: ProfileReducer,
  Dashboard: DashboardReducer,
  User: UsersReducers,
  Tool: ToolReducer,
  Gpt: GptReduces,
  NewsLatter: NewsLatterReducer,
});

export default rootReducer;
