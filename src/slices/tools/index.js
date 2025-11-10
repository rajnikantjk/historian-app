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
  toolData: [],
  toolCount: 0,
  toolCategoryData: [],
  toolCategoryCount: 0,
  toolSubCategoryData: [],
  toolSubCategoryCount: 0,
  groupMappingData: [],
  groupMappingCount: 0,
  intervalData: [],
  frequencyData:[],
  toolLoader: false,
};

export const getTools = createAsyncThunk(
  "user/get-all-tools",
  async (data, thunkAPI) => {
    https: return await thunkHandler(get("/aiTool/get-aiTool", data), thunkAPI);
  }
);
export const getTaglist = createAsyncThunk(
  "user/tag-list",
  async (data, thunkAPI) => {
    https: return await thunkHandler(
      get("/tag/", data),
      thunkAPI
    );
  }
);
export const  AddNewTagDetails = createAsyncThunk(
  "user/add-tag",
  async (data, thunkAPI) => {
    return await thunkHandler(
      post("tag/", data),
      thunkAPI
    );
  }
);
export const EditTagDetails = createAsyncThunk(
  "user/update-tag",
  async (data, thunkAPI) => {
    return await thunkHandler(
      put(`tag/`, data),
      thunkAPI
    );
  }
);

export const  AddNewGroupDetails = createAsyncThunk(
  "user/add-group",
  async (data, thunkAPI) => {
    return await thunkHandler(
      post("grp/", data),
      thunkAPI
    );
  }
);
export const EditGroupDetails = createAsyncThunk(
  "user/update-group",
  async (data, thunkAPI) => {
    return await thunkHandler(
      put(`grp/`, data),
      thunkAPI
    );
  }
);
export const getTagGroupList = createAsyncThunk(
  "user/get-all-taggrouplist",
  async (data, thunkAPI) => {
    https: return await thunkHandler(
      get("grp/"),
      thunkAPI
    );
  }
);

export const getMappedGroupList = createAsyncThunk(
  "user/get-all-mappedgrouplist",
  async (data, thunkAPI) => {
    https: return await thunkHandler(
      get("tag-grp-mapping/"),
      thunkAPI
    );
  }
);


export const getHistoryDataList = createAsyncThunk(
  "user/get-all-historydatalist",
  async (data, thunkAPI) => {
    https: return await thunkHandler(
      get(`opc/history-trend-tag-wise-details/${data?.grpId}/${data.startDate}/${data.endDate}`, data),
      thunkAPI
    );
  }
);

export const AddGroupMapping = createAsyncThunk(
  "user/add-groupmapping",
  async (data, thunkAPI) => {
    return await thunkHandler(
      post("tag-grp-mapping/", data),
      thunkAPI
    );
  }
);

export const UpdateGroupMapping = createAsyncThunk(
  "user/update-groupmapping",
  async (data, thunkAPI) => {
    return await thunkHandler(
      put("tag-grp-mapping/", data),
      thunkAPI
    );
  }
);
export const LivetrandGetData = createAsyncThunk(
  "user/get-livetrend",
  async (data, thunkAPI) => {
    return await thunkHandler(
      get(
        `opc/live-trend-tag-wise/${data?.grpId}/${data?.interval}`,
        data?.body
      ),
      thunkAPI
    );
  }
);


export const LivetrandReportDownloadData = createAsyncThunk(
  "user/get-livetrendreport",
  async (data, thunkAPI) => {
    const config = {
      params: data?.body,              // Pass any additional body params if necessary
      responseType: 'blob'             // Set the response type to 'blob' to handle binary data
    };
    return await thunkHandler(
      get(
        `opc/live-trend-excel/${data?.grpId}/${data?.interval}`,
        config
      ),
      thunkAPI
    );
  }
);

export const HistorytrendReportDownloadData = createAsyncThunk(
  "user/get-historytrendreport",
  async (data, thunkAPI) => {
    const config = {
      params: data?.body,              // Pass any additional body params if necessary
      responseType: 'blob'             // Set the response type to 'blob' to handle binary data
    };
    return await thunkHandler(
      get(
        `opc/history-trend-excel/${data?.grpId}/${data?.interval}/${data?.startDate}/${data?.endDate}`,
        config
      ),
      thunkAPI
    );
  }
);

export const HistorytrendData = createAsyncThunk(
  "user/get-historytrendData",
  async (data, thunkAPI) => {
    const config = {
      params: data?.body             // Set the response type to 'blob' to handle binary data
    };
    return await thunkHandler(
      get(
        `opc/history-trend-tag-wise/${data?.grpId}/${data?.interval}/${data?.startDate}/${data?.endDate}`,
        config
      ),
      thunkAPI
    );
  }
);



export const getIntervalList = createAsyncThunk(
  "user/get-all-tagintervallist",
  async (data, thunkAPI) => {
    https: return await thunkHandler(
      get("dropdown/interval/"),
      thunkAPI
    );
  }
);

export const getFrequencyList = createAsyncThunk(
  "user/get-all-tagfrequencylist",
  async (data, thunkAPI) => {
    https: return await thunkHandler(
      get("dropdown/frequency/"),
      thunkAPI
    );
  }
);

export const DeleteGroupData = createAsyncThunk(
  "tag/delete-group",
  async (data, thunkAPI) => {
    https: return await thunkHandler(
      del(`/grp/${data?.id}`, data),
      thunkAPI
    );
  }
);
export const DeleteTagData = createAsyncThunk(
  "tag/delete-tag",
  async (data, thunkAPI) => {
    https: return await thunkHandler(
      del(`/tag/${data?.id}`, data),
      thunkAPI
    );
  }
);
export const DeleteMappingData = createAsyncThunk(
  "user/delete-mappingdata",
  async (data, thunkAPI) => {
  
    return await thunkHandler(
      del(`tag-grp-mapping/${data?.id}`),
      thunkAPI
    );
  }
);
export const DeleteUser = createAsyncThunk(
  "user/deleteUser",
  async (data, thunkAPI) => {
    return await thunkHandler(post("user/deleteUser", data), thunkAPI);
  }
);
export const createAiTool = createAsyncThunk(
  "aiTool/createAiTool",
  async ({ body }, thunkAPI) => {
    return await thunkHandler(
      postFormData("aiTool/add-aiTool", body),
      thunkAPI
    );
  }
);
export const updateOPCalarm = createAsyncThunk(
  "user/updateOPCalarm",
  async (body, thunkAPI) => {
    return await thunkHandler(
      post(`opc/${body.type}`),
      thunkAPI
    );
  }
);
const ToolSlice = createSlice({
  name: "ToolSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getTools.pending, (state, action) => {
        state.toolLoader = true;
      })
      .addCase(getTools.fulfilled, (state, action) => {
        state.toolData = action?.payload?.payload?.aiTool;
        state.toolCount = action?.payload?.payload?.count;
        state.toolLoader = false;
      })
      .addCase(getTools.rejected, (state, action) => {
        state.toolData = {};
        state.toolLoader = false;
      })
      .addCase(getTaglist.pending, (state, action) => {
        state.toolLoader = true;
      })
      .addCase(getTaglist.fulfilled, (state, action) => {
        console.log("toolslist",action);
        state.toolCategoryData = action?.payload;
        // state.toolCategoryCount = action?.payload?.payload?.TotalCount;
        state.toolLoader = false;
      })
      .addCase(getTaglist.rejected, (state, action) => {
        state.toolData = {};
        state.toolLoader = false;
      })
      .addCase(getFrequencyList.pending, (state, action) => {
        state.toolLoader = true;
      })
      .addCase(getFrequencyList.fulfilled, (state, action) => {
        state.frequencyData = action?.payload?.data;
        // state.toolSubCategoryCount = action?.payload?.payload?.count;
        state.toolLoader = false;
      })
      .addCase(getFrequencyList.rejected, (state, action) => {
        state.frequencyData = [];
        state.toolLoader = false;
      })
      .addCase(getIntervalList.pending, (state, action) => {
        state.toolLoader = true;
      })
      .addCase(getIntervalList.fulfilled, (state, action) => {
        state.intervalData = action?.payload?.data;
        // state.toolSubCategoryCount = action?.payload?.payload?.count;
        state.toolLoader = false;
      })
      .addCase(getIntervalList.rejected, (state, action) => {
        state.intervalData = [];
        state.toolLoader = false;
      })
      .addCase(getTagGroupList.pending, (state, action) => {
        state.toolLoader = true;
      })
      .addCase(getTagGroupList.fulfilled, (state, action) => {
        state.toolSubCategoryData = action?.payload;
        // state.toolSubCategoryCount = action?.payload?.payload?.count;
        state.toolLoader = false;
      })
      .addCase(getTagGroupList.rejected, (state, action) => {
        state.toolData = {};
        state.toolLoader = false;
      })
      .addCase(getMappedGroupList.pending, (state, action) => {
        state.toolLoader = true;
      })
      .addCase(getMappedGroupList.fulfilled, (state, action) => {
        state.groupMappingData = action?.payload?.data;
        // state.groupMappingount = action?.payload?.payload?.count;
        state.toolLoader = false;
      })
      .addCase(getMappedGroupList.rejected, (state, action) => {
        state.toolData = {};
        state.toolLoader = false;
      })
      .addCase(createAiTool.pending, (state, action) => {
        state.toolLoader = true;
      })
      .addCase(createAiTool.fulfilled, (state, action) => {
        state.toolLoader = false;
      })
      .addCase(createAiTool.rejected, (state, action) => {
        state.toolLoader = false;
      })
      .addCase(updateOPCalarm.pending, (state, action) => {
        state.toolLoader = true;
      })
      .addCase(updateOPCalarm.fulfilled, (state, action) => {
        state.toolLoader = false;
      })
      .addCase(updateOPCalarm.rejected, (state, action) => {
        state.toolLoader = false;
      });
  },
});

export const {} = ToolSlice.actions;

export default ToolSlice.reducer;
