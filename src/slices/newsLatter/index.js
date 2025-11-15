import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  get,
  post,
  postFormData,
  put,
  putFormData,
  thunkHandler,
} from "../../helpers/base";

const initialState = {
  newsLatterData: [],
  newsLatterCount: 0,
  newsLatterLoader: false,
};

export const getNewsLatter = createAsyncThunk(
  "/user/get-newsLatter",
  async (data, thunkAPI) => {
    return await thunkHandler(
      get(
        `/adminRoutes/newsletter-sending-history`,
        data
      ),
      thunkAPI
    );
  }
);

export const sentNewsLatter = createAsyncThunk(
  "aiTool/sentNewsLatter",
  async (data , thunkAPI) => {
    return await thunkHandler(
      post("/adminRoutes/send-newsletter-email", data),
      thunkAPI
    );
  }
);

export const sentEmail = createAsyncThunk(
  "aiTool/sentEmail",
  async (body, thunkAPI) => {
    
    return await thunkHandler(
      postFormData("adminRoutes/send-email", body),
      thunkAPI
    );
  }
);

const NewsLatterSlice = createSlice({
  name: "NewsLatterSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getNewsLatter.pending, (state, action) => {
        state.newsLatterLoader = true;
      })
      .addCase(getNewsLatter.fulfilled, (state, action) => {
        // console.log(action?.payload?.payload?.data);
        state.newsLatterData = action?.payload?.payload?.data;
        state.newsLatterCount = action?.payload?.payload?.count;
        state.newsLatterLoader = false;
      })
      .addCase(getNewsLatter.rejected, (state, action) => {
        state.newsLatterData = [];
        state.newsLatterLoader = false;
      })
      .addCase(sentNewsLatter.pending, (state, action) => {
        state.newsLatterLoader = true;
      })
      .addCase(sentNewsLatter.fulfilled, (state, action) => {
        state.newsLatterLoader = false;
      })
      .addCase(sentNewsLatter.rejected, (state, action) => {
        state.newsLatterLoader = false;
      })     .addCase(sentEmail.pending, (state, action) => {
        state.newsLatterLoader = true;
      })
      .addCase(sentEmail.fulfilled, (state, action) => {
        state.newsLatterLoader = false;
      })
      .addCase(sentEmail.rejected, (state, action) => {
        state.newsLatterLoader = false;
      });
  },
});

export const {} = NewsLatterSlice.actions;

export default NewsLatterSlice.reducer;
