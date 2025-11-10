import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { get, post, thunkHandler } from "../../helpers/base";

const initialState = {
  userData: [],
  userCount: 0,

  userLoader:false
};

export const getUsers = createAsyncThunk(
  "/user/get-all-users",
  async ( data, thunkAPI) => {
    return await thunkHandler(
      get("/user/get-all-users", data),
      thunkAPI
    );
  }
);
export const DeleteUser = createAsyncThunk(
  "user/deleteUser",
  async ( data, thunkAPI) => {
    return await thunkHandler(
      post("user/deleteUser" , data),
      thunkAPI
    );
  }
);

const UsersSlice = createSlice({
  name: "UsersSlice",
  initialState,
  reducers: {
 
  },
  extraReducers: (builder) => {
    builder.addCase(getUsers.pending, (state, action) => {
        state.userLoader = true;

      });
    builder.addCase(getUsers.fulfilled, (state, action) => {
      state.userData = action?.payload?.payload?.users;
      state.userCount = action?.payload?.payload?.totalCount;
      state.userLoader = false;

    });
    builder.addCase(getUsers.rejected, (state, action) => {
      state.userData = {};
      state.userLoader = false;

    });
  },
});

export const {  } = UsersSlice.actions;

export default UsersSlice.reducer;
