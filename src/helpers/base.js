import axios from "axios";
import { BASE_URL } from "./api.config";
import { useProfile } from "../Components/Hooks/UserHooks";
export const API_PREFIX = "";
const axiosApi = axios.create({
  baseURL: `${BASE_URL.endpoint}`,
});

// const { userProfile, loading, token } = useProfile();
// const token = localStorage.getItem("UserToken") ? localStorage.getItem("UserToken") : null;
const getToken = () => {
  let token = localStorage.getItem("UserToken");
  return token;
};

export const defaultHeaders = {
  contentType: "application/json",
  token:   getToken(),
};
const axiosInstance = axiosApi;
export async function get(url, config = {}) {
  return new Promise((resolve, reject) => {
    axiosApi
      .get(url, { params: config?.params, headers: authHeader() ,responseType: config?.responseType || 'json'})
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
        if (err.response?.status === 403) {
          // Clear localStorage
          localStorage.clear();

          // Redirect to login page
          window.location.href = "/login"; // or use your login route
        }
      });
  });
}
export async function patch(url, data, config = {}) {
  return await axiosApi
    .patch(url, { ...data }, { ...config })
    .then((response) => response)
    .catch((error) => error.response);
}
export async function post(url, data, config = {}) {
  return new Promise((resolve, reject) => {
    axiosApi
      .post(url, { ...data }, { ...config, headers: authHeader() })
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
        if (err.response?.status === 403) {
          // Clear localStorage
          localStorage.clear();

          // Redirect to login page
          window.location.href = "/login"; // or use your login route
        }
      });
  });
}

export async function postFormData(url, data, config = {}) {
  return new Promise((resolve, reject) => {
    axiosApi
      .post(url, data, {
        ...config,
        headers: authHeader({
          ...defaultHeaders,
          contentType: "multipart/form-data",
        }),
      })
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
        if (err.response?.status === 403) {
          // Clear localStorage
          localStorage.clear();

          // Redirect to login page
          window.location.href = "/login"; // or use your login route
        }
      });
  });
}
export async function putFormData(url, data, config = {}) {
  return new Promise((resolve, reject) => {
    axiosApi
      .put(url, data, {
        ...config,
        headers: authHeader({
          ...defaultHeaders,
          contentType: "multipart/form-data",
        }),
      })
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
        if (err.response?.status === 403) {
          // Clear localStorage
          localStorage.clear();

          // Redirect to login page
          window.location.href = "/login"; // or use your login route
        }
      });
  });
}

export async function put(url, data, config = {}) {
  return new Promise((resolve, reject) => {
    axiosApi
      .put(url, { ...data }, { ...config, headers: authHeader() })
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
        if (err.response?.status === 403) {
          // Clear localStorage
          localStorage.clear();

          // Redirect to login page
          window.location.href = "/login"; // or use your login route
        }
      });
  });
}
export async function del(url, config = {}) {
  return new Promise((resolve, reject) => {
    axiosApi
      .delete(url, { ...config, headers: authHeader() })
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
        if (err.response?.status === 403) {
          // Clear localStorage
          localStorage.clear();

          // Redirect to login page
          window.location.href = "/login"; // or use your login route
        }
      });
  });
}

export const thunkHandler = async (asyncFn, thunkAPI) => {
  try {
    const response = await asyncFn;
    return response.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response);
  }
};

export const authHeader = (header = defaultHeaders) => {
  let token = getToken();
  let headers = {
    "Content-Security-Policy": "default-src 'self',frame-src 'self'",
    // "ngrok-skip-browser-warning": true,
    // "User-Agent": true,
  };
  if (token) {
    headers["Authorization"] = token;
  }
  if (header.contentType) {
    headers["Content-Type"] = header.contentType;
  }
  return headers;
};
