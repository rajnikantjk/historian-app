import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { get, thunkHandler } from "../../helpers/base";

const initialState = {
  dashboardData: [],
  loader:false
};

export const getDashboard = createAsyncThunk(
  "/dashboard",
  async ( data, thunkAPI) => {
    return await thunkHandler(
      get("/dashboard"),
      thunkAPI
    );
  }
);

const DashboardSlice = createSlice({
  name: "DashboardSlice",
  initialState,
  reducers: {
 
  },
  extraReducers: (builder) => {
    builder.addCase(getDashboard.pending, (state, action) => {
        state.loader = true;

      });
    builder.addCase(getDashboard.fulfilled, (state, action) => {
      state.dashboardData = action.payload.payload;
      state.loader = false;

    });
    builder.addCase(getDashboard.rejected, (state, action) => {
      state.dashboardData = {};
      state.loader = false;

    });
  },
});

export const {  } = DashboardSlice.actions;

export default DashboardSlice.reducer;
