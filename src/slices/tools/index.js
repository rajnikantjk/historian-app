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
  schedulerListData: [],
  schedulerListCount: 0,
  toolSubCategoryCount: 0,
  groupMappingData: [],
  groupMappingCount: 0,
  intervalData: [],
  slotsData: [],
  frequencyData:[],
  tagDataByGroup: [],
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
  async (params = {}, thunkAPI) => {
    const { page = 1, limit = 1000, search = '' } = params;
    const queryString = `?page=${page - 1}&size=${limit}${search ? `&search=${encodeURIComponent(search)}` : ''}`;
    
    return await thunkHandler(
      get(`/tag${queryString}`, {}),
      thunkAPI
    );
  }
);
export const  AddNewTagDetails = createAsyncThunk(
  "user/add-tag",
  async (data, thunkAPI) => {
    return await thunkHandler(
      post("tag", data),
      thunkAPI
    );
  }
);
export const EditTagDetails = createAsyncThunk(
  "user/update-tag",
  async (data, thunkAPI) => {
    return await thunkHandler(
      put(`tag`, data),
      thunkAPI
    );
  }
);

export const  AddNewGroupDetails = createAsyncThunk(
  "user/add-group",
  async (data, thunkAPI) => {
    return await thunkHandler(
      post("grp", data),
      thunkAPI
    );
  }
);
export const EditGroupDetails = createAsyncThunk(
  "user/update-group",
  async (data, thunkAPI) => {
    return await thunkHandler(
      put(`grp`, data),
      thunkAPI
    );
  }
);
export const getTagGroupList = createAsyncThunk(
  "user/get-all-taggrouplist",
  async (params = {}, thunkAPI) => {
    const { page = 1, limit = 1000, search = '' } = params;
    const queryParams = new URLSearchParams({
      page:page-1,
      size:limit,
      ...(search && { search })
    });
    
    return await thunkHandler(
      get(`grp?${queryParams.toString()}`),
      thunkAPI
    );
  }
);

export const getSchedulerList = createAsyncThunk(
  "user/get-all-schedulerlist",
  async (params = {}, thunkAPI) => {
    const { page = 1, limit = 1000, search = '' } = params;
    const queryParams = new URLSearchParams({
      page:page-1,
      size:limit,
      ...(search && { search })
    });
    
    return await thunkHandler(
      get(`schedule-task?${queryParams.toString()}`),
      thunkAPI
    );
  }
);


export const getMappedGroupList = createAsyncThunk(
  "user/get-all-mappedgrouplist",
  async (params = {}, thunkAPI) => {
    const { page = 1, limit = 1000, search = '' } = params;
    const queryParams = new URLSearchParams({
      page:page-1,
      size:limit,
      ...(search && { search })
    });
    
    return await thunkHandler(
      get(`tag-grp-mapping?${queryParams.toString()}`),
      thunkAPI
    );
  }
);


export const getHistoryDataList = createAsyncThunk(
  "user/get-all-historydatalist",
  async (data, thunkAPI) => {
    const { startDate, endDate, defaultLoad, grpId, tagId, ...restParams } = data || {};
    const queryParams = new URLSearchParams({
      startDateTime:startDate,
      endDateTime:endDate,
      defaultLoad,
      ...(defaultLoad !== "Y" && { grpId, tagId }),
      ...restParams
    }).toString();
    
    return await thunkHandler(
      get(`opc/history-trend-tag-wise-details?${queryParams}`, { ...data, noLoader: true }),
      thunkAPI
    );
  }
);

export const AddGroupMapping = createAsyncThunk(
  "user/add-groupmapping",
  async (data, thunkAPI) => {
    return await thunkHandler(
      post("tag-grp-mapping", data),
      thunkAPI
    );
  }
);

export const UpdateGroupMapping = createAsyncThunk(
  "user/update-groupmapping",
  async (data, thunkAPI) => {
    return await thunkHandler(
      put("tag-grp-mapping", data),
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
        data?.tagId != null?
        `opc/history-trend-excel/${data?.grpId}/${data?.interval}/${data?.startDate}/${data?.endDate}?tagId=${data?.tagId}`:
        `opc/history-trend-excel/${data?.grpId}/${data?.interval}/${data?.startDate}/${data?.endDate}?tagId=${data?.tagId}`,
        config
      ),
      thunkAPI
    );
  }
);

export const HistorytrendData = createAsyncThunk(
  "user/get-historytrendData",
  async (data, thunkAPI) => {
    const { grpId, interval, startDate, endDate, tagId, defaultLoad,slot, ...restParams } = data || {};
    const queryParams = new URLSearchParams({
      grpId,
      defaultLoad,
      timeSpan:interval,
      startDateTime:startDate,
      endDateTime:endDate,
      ...(slot && { slot }),
      ...(tagId && { tagId }),
      ...restParams
    }).toString();
    
    return await thunkHandler(
      get(`opc/history-trend-tag-wise?${queryParams}`),
      thunkAPI
    );
  }
);


export const getSlotsList = createAsyncThunk(
  "user/get-all-slotlist",
  async (data, thunkAPI) => {
    https: return await thunkHandler(
      get("dropdown/time-slots"),
      thunkAPI
    );
  }
);


export const getIntervalList = createAsyncThunk(
  "user/get-all-tagintervallist",
  async (data, thunkAPI) => {
    https: return await thunkHandler(
      get("dropdown/time-span"),
      thunkAPI
    );
  }
);

export const getFrequencyList = createAsyncThunk(
  "user/get-all-tagfrequencylist",
  async (data, thunkAPI) => {
    https: return await thunkHandler(
      get("dropdown/update-rate"),
      thunkAPI
    );
  }
);

export const getTagsByGroupId = createAsyncThunk(
  "user/get-tags-by-group-id",
  async (grpId, thunkAPI) => {
    https: return await thunkHandler(
      get(`tag/fetch-by-group-id/${grpId}`),
      thunkAPI
    );
  }
);
export const getCompanyLogo= createAsyncThunk(
  "user/get-getCompanyLogo",
  async (grpId, thunkAPI) => {
    https: return await thunkHandler(
      get(`company`),
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

export const tagDataDownload = createAsyncThunk(
  "user/get-tagDataDownload",
  async (data, thunkAPI) => {
    const config = {
      responseType: 'blob'             // Set the response type to 'blob' to handle binary data
    };
    return await thunkHandler(
      get(
        `tag/export`,
        config
      ),
      thunkAPI
    );
  }
);  

export const groupDataDownload = createAsyncThunk(
  "user/get-groupDataDownload",
  async (data, thunkAPI) => {
    const config = {
      responseType: 'blob'             // Set the response type to 'blob' to handle binary data
    };
    return await thunkHandler(
      get(
        `report/tag-master-report`,
        config
      ),
      thunkAPI
    );
  }
);

export const tagBulkImport = createAsyncThunk(
  "user/tag-bulk-import",
  async (formData, thunkAPI) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };
    return await thunkHandler(
      postFormData(
        `tag/bulk-import`,
        formData,
        config
      ),
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
        // console.log("toolslist",action);
        state.toolCategoryData = action?.payload?.content;
        state.toolCategoryCount = action?.payload?.totalElements;
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
      .addCase(getTagsByGroupId.pending, (state, action) => {
        state.toolLoader = true;
      })
      .addCase(getTagsByGroupId.fulfilled, (state, action) => {
        state.tagDataByGroup = action?.payload?.data || action?.payload || [];
        state.toolLoader = false;
      })
      .addCase(getTagsByGroupId.rejected, (state, action) => {
        state.tagDataByGroup = [];
        state.toolLoader = false;
      })
      .addCase(getSlotsList.pending, (state, action) => {
        state.toolLoader = true;
      })
      .addCase(getSlotsList.fulfilled, (state, action) => {
        state.slotsData = action?.payload?.data;
        state.toolLoader = false;
      })
      .addCase(getSlotsList.rejected, (state, action) => {
        state.slotsData = [];
        state.toolLoader = false;
      })
       .addCase(getIntervalList.pending, (state, action) => {
        state.toolLoader = true;
      })
      .addCase(getIntervalList.fulfilled, (state, action) => {
        state.intervalData = action?.payload?.data;
        state.toolLoader = false;
      })
      .addCase(getIntervalList.rejected, (state, action) => {
        state.intervalData = [];
        state.toolLoader = false;
      })
      .addCase(getSchedulerList.pending, (state, action) => {
        state.toolLoader = true;
      })
      .addCase(getSchedulerList.fulfilled, (state, action) => {
        state.schedulerListData = action?.payload?.content;
        state.schedulerListCount = action?.payload?.totalElements;
        state.toolLoader = false;
      })
      .addCase(getSchedulerList.rejected, (state, action) => {
        state.toolData = {};
        state.toolLoader = false;
      })

      .addCase(getTagGroupList.pending, (state, action) => {
        state.toolLoader = true;
      })
      .addCase(getTagGroupList.fulfilled, (state, action) => {
        state.toolSubCategoryData = action?.payload?.content;
        state.toolSubCategoryCount = action?.payload?.totalElements;
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
        state.groupMappingData = action?.payload?.content;
        state.groupMappingCount = action?.payload?.totalElements;
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
      })
      .addCase(tagDataDownload.pending, (state, action) => {
        state.toolLoader = true;
      })
      .addCase(tagDataDownload.fulfilled, (state, action) => {
        state.toolLoader = false;
      })
      .addCase(tagDataDownload.rejected, (state, action) => {
        state.toolLoader = false;
      })
      .addCase(groupDataDownload.pending, (state, action) => {
        state.toolLoader = true;
      })
      .addCase(groupDataDownload.fulfilled, (state, action) => {
        state.toolLoader = false;
      })
      .addCase(groupDataDownload.rejected, (state, action) => {
        state.toolLoader = false;
      });
  },
});

export const {} = ToolSlice.actions;

export default ToolSlice.reducer;
