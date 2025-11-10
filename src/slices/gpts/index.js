import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  del,
  get,
  post,
  postFormData,
  put,
  putFormData,
  thunkHandler,
} from "../../helpers/base";

const initialState = {
  gptData: [],
  gptCount: 0,
  gptCategoryData: [],
  gptCategoryCount: 0,
  gptSubCategoryData: [],
  gptSubCategoryCount: 0,
  gptLoader: false,
  gptCategoryLoader: false,
  gptSubcategoryLoader: false,
};

export const getGpts = createAsyncThunk(
  "app/get-app",
  async (data, thunkAPI) => {
    return await thunkHandler(get("app/get-app", data), thunkAPI);
  }
);
export const ActiveInactiveGpts = createAsyncThunk(
  "/approve-app",
  async (data, thunkAPI) => {
    return await thunkHandler(put(`/app/approve-app`, data), thunkAPI);
  }
);
export const getGptsCategory = createAsyncThunk(
  "/mainCategory/get",
  async (data, thunkAPI) => {
    return await thunkHandler(get("/mainCategory/get", data), thunkAPI);
  }
);
export const AddGptsCategory = createAsyncThunk(
  "/mainCategory/create",
  async (data, thunkAPI) => {
    return await thunkHandler(post("/mainCategory/create", data), thunkAPI);
  }
);
export const EditGptsCategory = createAsyncThunk(
  "/mainCategory/update/${id}",
  async (data, thunkAPI) => {
    return await thunkHandler(
      put(`/mainCategory/update/${data?.id}`, data),
      thunkAPI
    );
  }
);
export const getGptsSubCategory = createAsyncThunk(
  "/category/get-category",
  async (data, thunkAPI) => {
    https: return await thunkHandler(
      get("/category/get-category", data),
      thunkAPI
    );
  }
);
export const AddGptsSubcategory = createAsyncThunk(
  "category/create-category",
  async (data, thunkAPI) => {
    return await thunkHandler(
      postFormData("category/create-category", data?.body),
      thunkAPI
    );
  }
);
export const EditGptsSubcategory = createAsyncThunk(
  "category/update-category/${body?.id}",
  async (data, thunkAPI) => {
    return await thunkHandler(
      putFormData(`category/update-category/${data?.id}`, data?.body),
      thunkAPI
    );
  }
);
export const UpdateGptCategory = createAsyncThunk(
  "/mainCategory/updates",
  async (data, thunkAPI) => {
    return await thunkHandler(
      put(`/mainCategory/update/${data?.id}`, data),
      thunkAPI
    );
  }
);
export const deleteGptCategory = createAsyncThunk(
  "/mainCategory/updates",
  async (id, thunkAPI) => {
    return await thunkHandler(del(`/mainCategory/delete/${id}`), thunkAPI);
  }
);
export const deleteGptsubCategory = createAsyncThunk(
  "/mainCategory/updates",
  async (id, thunkAPI) => {
    return await thunkHandler(del(`/category/delete-category/${id}`), thunkAPI);
  }
);
export const UpdateGptSubCategory = createAsyncThunk(
  "category/update-category",
  async (data, thunkAPI) => {
    const formdata = new FormData();
    formdata.append("status", data.status);
    return await thunkHandler(
      putFormData(`category/update-category/${data?.id}`, formdata),
      thunkAPI
    );
  }
);
export const createGPT = createAsyncThunk(
  "aiTool/createGPT",
  async ({ body }, thunkAPI) => {
    return await thunkHandler(postFormData("app/create-app", body), thunkAPI);
  }
);
export const updateGPT = createAsyncThunk(
  "aiTool/updateGPT",
  async ({ body, id }, thunkAPI) => {
    return await thunkHandler(
      putFormData(`app/update-app/${id}`, body),
      thunkAPI
    );
  }
);
const GptSlice = createSlice({
  name: "GptSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getGpts.pending, (state, action) => {
        state.gptLoader = true;
      })
      .addCase(getGpts.fulfilled, (state, action) => {
        state.gptData = action?.payload?.payload?.app;
        state.gptCount = action?.payload?.payload?.count;
        state.gptLoader = false;
      })
      .addCase(getGpts.rejected, (state, action) => {
        state.gptData = {};
        state.gptLoader = false;
      })
      .addCase(getGptsCategory.pending, (state, action) => {
        state.gptCategoryLoader = true;
      })
      .addCase(getGptsCategory.fulfilled, (state, action) => {
        state.gptCategoryData = action?.payload?.payload?.categorys;
        state.gptCategoryCount = action?.payload?.payload?.count;
        state.gptCategoryLoader = false;
      })
      .addCase(getGptsCategory.rejected, (state, action) => {
        state.gptData = {};
        state.gptCategoryLoader = false;
      })
      .addCase(getGptsSubCategory.pending, (state, action) => {
        state.gptSubcategoryLoader = true;
      })
      .addCase(getGptsSubCategory.fulfilled, (state, action) => {
        state.gptSubCategoryData = action?.payload?.payload?.categorys;

        state.gptSubCategoryCount = action?.payload?.payload?.count;
        state.gptSubcategoryLoader = false;
      })
      .addCase(getGptsSubCategory.rejected, (state, action) => {
        state.gptData = {};
        state.gptSubcategoryLoader = false;
      })
      .addCase(createGPT.pending, (state, action) => {
        state.gptLoader = true;
      })
      .addCase(createGPT.fulfilled, (state, action) => {
        state.gptLoader = false;
      })
      .addCase(createGPT.rejected, (state, action) => {
        state.gptLoader = false;
      })
      .addCase(updateGPT.pending, (state, action) => {
        state.gptLoader = true;
      })
      .addCase(updateGPT.fulfilled, (state, action) => {
        state.gptLoader = false;
      })
      .addCase(updateGPT.rejected, (state, action) => {
        state.gptLoader = false;
      });
  },
});

export const {} = GptSlice.actions;

export default GptSlice.reducer;
