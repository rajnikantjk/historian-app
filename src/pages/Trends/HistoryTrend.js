

import React, { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
    Card,
    CardBody,
    CardHeader,
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Button,
    Input,
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane,
    Container,
    Row,
    Col,
    Table,
} from "reactstrap";
import Chart from "react-apexcharts";
import DatePicker from "react-datepicker";
import classnames from "classnames";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";
import { getHistoryDataList, getIntervalList, getTagGroupList, HistorytrendData, HistorytrendReportDownloadData, getTagsByGroupId } from "../../slices/tools";
import moment from "moment";
import { Tooltip } from "react-tooltip";
import { FaDownload, FaHistory, FaCamera } from "react-icons/fa";
import { FaFileExcel } from "react-icons/fa";
import html2canvas from "html2canvas";
import Loader from "../../Components/Common/Loader";
import { toast } from "react-toastify";
import ReactApexChart from "react-apexcharts";

// Custom Option component with checkbox for multiselect
const CustomOption = ({ innerProps, label, isSelected, isFocused, data, selectProps }) => {
    const isSelectAll = data?.value === 'select-all';
    const isDeselectAll = data?.value === 'deselect-all';

    return (
        <div
            {...innerProps}
            style={{
                padding: '8px 12px',
                cursor: 'pointer',
                backgroundColor: isFocused ? 'rgba(10, 179, 156, 0.18)' : 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: (isSelectAll || isDeselectAll) ? 'bold' : 'normal'
            }}
        >
            {!isSelectAll && !isDeselectAll && (
                <input
                    type="checkbox"
                    checked={isSelected}
                    readOnly
                    style={{
                        cursor: 'pointer',
                        margin: 0
                    }}
                />
            )}
            <span style={{ color: 'black' }}>{label}</span>
        </div>
    );
};

// Custom ValueContainer to show count instead of selected items
const CustomValueContainer = ({ children, ...props }) => {
    const selectedCount = props.getValue().filter(opt => opt && opt.value !== 'select-all' && opt.value !== 'deselect-all').length;
    const hasValue = selectedCount > 0;

    // Get the input element from children (it's usually the last child)
    const childrenArray = React.Children.toArray(children);
    const inputElement = childrenArray[childrenArray.length - 1]; // Input is typically the last child

    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', flex: 1, alignItems: 'center', minHeight: '38px' }}>
            <div style={{ padding: '2px 8px', color: hasValue ? 'black' : '#6c757d', flex: '0 0 auto' }}>
                {hasValue ? (
                    `${selectedCount} ${selectedCount === 1 ? 'tag selected' : 'tags selected'}`
                ) : (
                    props.selectProps.placeholder
                )}
            </div>
            {inputElement}
        </div>
    );
};

const singleSelectStyle = {
    control: (provided) => ({
        ...provided,
        border: "1px solid #ced4da",
        boxShadow: "none",
        "&:hover": {
            border: "1px solid #ced4da",
        },
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected
            ? "rgba(10, 179, 156)"
            : state.isFocused
                ? "rgba(10, 179, 156, 0.18)"
                : "white",
        color: state.isSelected ? "white" : "black",
        "&:hover": {
            backgroundColor: "rgba(10, 179, 156, 0.18)",
            color: "black",
        },
    }),
};

const multiSelectStyle = {
    control: (provided) => ({
        ...provided,
        border: "1px solid #ced4da",
        boxShadow: "none",
        "&:hover": {
            border: "1px solid #ced4da",
        },
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isFocused
            ? "rgba(10, 179, 156, 0.18)"
            : "white",
        color: "black",
        "&:hover": {
            backgroundColor: "rgba(10, 179, 156, 0.18)",
            color: "black",
        },
    }),
    multiValueLabel: (provided) => ({
        ...provided,
        color: "black",
    }),
    multiValue: () => ({
        display: 'none', // Hide individual selected items
    }),
    input: (provided) => ({
        ...provided,
        color: "black",
    }),
    placeholder: (provided) => ({
        ...provided,
        color: "#6c757d",
    }),
};
const HistoryTrend = () => {
    const { toolSubCategoryData, intervalData, tagDataByGroup } = useSelector(
        (state) => state.Tool)
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [screenshotLoading, setScreenshotLoading] = useState(false);
    const historyTrendRef = useRef(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [startDate, setStartDate] = useState(moment().startOf('day').toDate());
    const [endDate, setEndDate] = useState(moment().endOf('day').toDate());
    const [activeTab, setActiveTab] = useState("taglist");
    const [selectedTags, setSelectedTags] = useState([]);
    const [selectedTagIds, setSelectedTagIds] = useState([]);
    const [values, setValues] = useState({});
    const [tableData, setTableData] = useState([]);
    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
    const toggleTab = (tab) => setActiveTab(tab);
    const [apiCalled, setApiCalled] = useState(false);
    const colorList = [
        "#008FFB", "#00E396", "#FEB019", "#FF4560", "#775DD0",
        "#546E7A", "#26a69a", "#D10CE8", "#ff6384", "#36a2eb"
    ];
    const [state, setState] = React.useState({
        series: [
            { name: "", data: [] },
            { name: "", data: [] },
        ],
        options: {
            chart: { id: 'chart1', type: "line", height: 650, toolbar: { show: false } },
            stroke: { width: 3, curve: "smooth" },
            dataLabels: {
                enabled: true,
                // show a colored dot instead of numeric label
                formatter: function (_val, opts) {
                    return '●';
                },
                offsetY: 2,
                style: {
                    // Apex maps these colors to series by index
                    colors: colorList,
                    fontSize: '20px',
                    fontWeight: '700'
                },
                background: { enabled: false },
                dropShadow: { enabled: false }
            },
            tooltip: {
                enabled: true,
                shared: true,
                intersect: false,
                followCursor: true,
                x: {
                    format: 'dd MMM yyyy HH:mm:ss',
                },
                custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                    // Get timestamp from category labels or x-axis data
                    let timestamp = w.globals.categoryLabels[dataPointIndex];

                    // If timestamp is not available, try to get it from x-axis categories
                    if (!timestamp && w.config.xaxis && w.config.xaxis.categories) {
                        timestamp = w.config.xaxis.categories[dataPointIndex];
                    }

                    // If still not available, format the current data point time
                    if (!timestamp && w.globals.seriesX && w.globals.seriesX[0]) {
                        const xValue = w.globals.seriesX[0][dataPointIndex];
                        if (xValue) {
                            timestamp = moment(xValue).format('dd MMM yyyy HH:mm:ss');
                        }
                    }

                    // Fallback to current time formatted
                    if (!timestamp) {
                        timestamp = moment().format('dd MMM yyyy HH:mm:ss');
                    }

                    const colors = w.globals.colors;
                    const seriesNames = w.globals.seriesNames;

                    // Build tooltip content for all series at this data point
                    let seriesItems = '';
                    let itemCount = 0;

                    series.forEach((serie, idx) => {
                        const value = serie[dataPointIndex];
                        const seriesName = seriesNames[idx] || `Tag ${idx + 1}`;
                        const color = colors[idx] || '#008FFB';

                        if (value !== null && value !== undefined) {
                            itemCount++;
                            seriesItems += `
                                <div style="display: flex; align-items: center; padding: 6px 8px; margin-bottom: 2px; border-radius: 4px; transition: background-color 0.2s;" 
                                     onmouseover="this.style.backgroundColor='#f5f5f5'" 
                                     onmouseout="this.style.backgroundColor='transparent'">
                                    <span style="display: inline-block; width: 10px; height: 10px; background: ${color}; border-radius: 50%; margin-right: 10px; flex-shrink: 0; box-shadow: 0 0 0 2px rgba(255,255,255,0.8), 0 0 0 3px ${color}20;"></span>
                                    <div style="flex: 1; min-width: 0;">
                                        <div style="font-size: 11px; color: #666; margin-bottom: 2px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${seriesName}">${seriesName} :- ${parseFloat(value)}</div>
                                      
                                    </div>
                                </div>
                            `;
                        }
                    });

                    const hasItems = itemCount > 0;
                    const maxHeight = itemCount > 10 ? '400px' : 'auto';

                    return `
                        <style>
                            .custom-tooltip .tooltip-timestamp {
                                color: #ffffff !important;
                            }
                            .custom-tooltip * {
                                color: inherit !important;
                            }
                        </style>
                       <div class="custom-tooltip"
                                style="
                                    background: #fff;
                                    border: 1px solid #e0e0e0;
                                    border-radius: 8px;
                                    padding: 0;
                                    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                                    width: ${itemCount > 6 ? '600px' : '320px'};
                                    max-width: ${itemCount > 6 ? '600px' : '320px'};
                                    overflow: hidden;
                                ">

                            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 12px 14px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid rgba(255,255,255,0.2);">
                                <div style="display: flex; align-items: center; justify-content: space-between;">
                                    <span class="tooltip-timestamp" style="color: #ffffff !important; font-weight: 600 !important; opacity: 1 !important; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">${timestamp}</span>
                                    
                                </div>
                            </div>
                       <div style="
                            max-height: ${maxHeight};
                            overflow-y: auto;
                            padding: 8px;
                            width: 100%;
                            max-width: none;
                            ${!hasItems ? 'padding: 10px; text-align: center;' : ''};
                        ">
                        <div style="
                            display: grid;
                            grid-template-columns: repeat(${itemCount > 6 ? 2 : 1}, minmax(0, 1fr));
                            width: 100%;
                            gap: 0px 10px;
                            box-sizing: border-box;
                        ">
                                ${hasItems ? seriesItems : '<div style="color: #999; font-size: 12px; padding: 10px 0;">No data available at this point</div>'}
                            </div>
                        </div>


                          
                        </div>
                    `;
                },
                style: {
                    fontSize: '12px',
                    fontFamily: 'inherit'
                },
                theme: 'light',
                marker: {
                    show: true
                }
            },
            yaxis: [
                {
                    seriesName: 'Tag Value',
                    axisTicks: {
                        show: true,
                        color: '#008FFB'
                    },
                    axisBorder: {
                        show: true,
                        color: '#008FFB'
                    },
                    labels: {
                        style: {
                            colors: '#008FFB',
                        }
                    },
                    title: {
                        text: "Tag Value",
                        style: {
                            color: '#008FFB'
                        }
                    },
                },
                {
                    seriesName: 'Tag Value',
                    opposite: true,
                    axisTicks: {
                        show: true,
                        color: '#00E396'
                    },
                    axisBorder: {
                        show: true,
                        color: '#00E396'
                    },
                    labels: {
                        style: {
                            colors: '#00E396'
                        }
                    },
                    title: {
                        text: "Tag Value",
                        style: {
                            color: '#00E396'
                        }
                    },
                }
            ],
            xaxis: {
                type: 'datetime',
                labels: {
                    datetimeUTC: false,
                    format: 'dd MMM HH:mm',
                    show: true, // 👈 This hides the X-axis labels
                }, categories: [
                    "2024-05-12",
                    "2024-05-14",
                    "2024-05-16",
                    "2024-05-20",
                    "2024-05-24",
                    "2024-05-26",
                    "2024-05-30",
                    "2024-06-01",
                ]
            },
            colors: ["#007bff", "#28a745", "#ffc107", "#dc3545", "#6610f2"],
        },
        seriesLine: [
            { name: "", data: [] },
            { name: "", data: [] },
        ],
        optionsLine: {
            chart: {
                id: 'chart2',
                type: "line", height: 130, brush: {
                    target: 'chart1',
                    enabled: true
                },
                selection: {
                    enabled: true,

                }, toolbar: { show: false }
            },
            stroke: {
                width: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,],
                curve: ['smooth', 'smooth', 'smooth', 'smooth', 'smooth', 'smooth', 'smooth', 'smooth', 'smooth', 'smooth', 'smooth', 'smooth', 'smooth', 'smooth', 'smooth', 'smooth', 'smooth', 'smooth',]
            },
            fill: {
                type: 'gradient',
                gradient: {
                    opacityFrom: 0.91,
                    opacityTo: 0.1,
                }
            },

            yaxis: {
                max: 100,
                tickAmount: 2
            },
            xaxis: {
                type: 'datetime',
                tooltip: {
                    enabled: false
                },
                categories: [
                    "2024-05-12",
                    "2024-05-14",
                    "2024-05-16",
                    "2024-05-20",
                    "2024-05-24",
                    "2024-05-26",
                    "2024-05-30",
                    "2024-06-01",
                ],
                labels: {
                    datetimeUTC: false, // Set to false to show in local time
                }
            },
            colors: colorList,
        },

    });
    const generateDynamicYaxes = (tagNames, colorList) => {
        return tagNames.map((tagName, index) => ({
            seriesName: tagName,
            show: false,
            axisTicks: {
                show: true,
                color: colorList[index % colorList.length]
            },
            axisBorder: {
                show: true,
                color: colorList[index % colorList.length]
            },
            labels: {
                style: {
                    colors: colorList[index % colorList.length],
                }
            },
            title: {
                text: tagName,
                style: {
                    color: colorList[index % colorList.length],
                    fontSize: '12px'
                }
            },
            opposite: index % 2 === 1 // Alternate sides for better visibility
        }));
    };
    // const tagOptions = [
    //     "PZ130003.PV",
    //     "PZ130031.PV",
    //     "PZ130039.PV",
    //     "PZ130040.PV",
    //     "FZ130124.PV",
    //     "FZ130125.PV",
    //     "PZ130005.PV",
    //     "PZ130021.PV",
    //     "PZ130069.PV",
    //     "PZ130080.PV",
    //     "FZ130122.PV",
    //     "FZ130126.PV",
    //     "PZ133021.PV",
    //     "PZ130269.PV",
    //     "PZ137080.PV",
    //     "FZ130322.PV",
    // ];

    const intervaldata = intervalData?.map((item, i) => {
        // if (i != 0 & i != 1) {
        return {
            value: item?.value,
            label: item?.key,
        };
        // }
    }).filter((data) => data != undefined);

    const groupdata = toolSubCategoryData.map((item) => {
        return {
            value: item?.id,
            label: item?.grpName,
        };
    });

    // Prepare tag options with Select All/Deselect All (vice versa based on selection)
    const tagOptions = React.useMemo(() => {
        const tagList = tagDataByGroup?.map((tag) => ({
            value: tag.id,
            label:tag.displayTagName ?? tag?.tagName
        })) || [];

        // Show "Deselect All" only when ALL tags are selected, otherwise show "Select All"
        const selectedTagValues = selectedTagIds.map(tag => tag.value);
        const allTagValues = tagList.map(tag => tag.value);
        const allTagsSelected = tagList.length > 0 &&
            allTagValues.length === selectedTagValues.length &&
            allTagValues.every(tagValue => selectedTagValues.includes(tagValue));

        const toggleOption = allTagsSelected
            ? { value: 'deselect-all', label: 'Deselect All' }
            : { value: 'select-all', label: 'Select All' };

        return [toggleOption, ...tagList];
    }, [tagDataByGroup, selectedTagIds]);
    const handleTagSelection = (tag) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };


    useEffect(() => {
        if (toolSubCategoryData.length > 0 && !values.grpId) {
            setValues(prevValues => ({
                ...prevValues,
                grpId: {
                    value: toolSubCategoryData[0]?.id,
                    label: toolSubCategoryData[0]?.grpName
                }
            }));
        }
    }, [toolSubCategoryData]);

    useEffect(() => {
        if (values?.grpId?.value) {
            dispatch(getTagsByGroupId(values.grpId.value)).then((res) => {
                // Tags are automatically stored in Redux state via the slice
            }).catch((err) => {
                console.error("Error fetching tags by group ID:", err);
                toast.error("Failed to fetch tags for selected group");
            });
        } else {
            // Clear tag data when no group is selected
            setSelectedTagIds([]);
        }
    }, [values?.grpId?.value, dispatch]);

    useEffect(() => {
        if (intervalData.length > 0 && !values.interval) {
            setValues(prevValues => ({
                ...prevValues,
                interval: {
                    value: intervalData[2]?.value,
                    label: intervalData[2]?.key
                }
            }));
        }
    }, [intervalData]);

    useEffect(() => {
        Promise.all([
            dispatch(getTagGroupList()),
            dispatch(getIntervalList()),

        ]);
    }, [dispatch]);

    const handleStartDateChange = (date) => {
        if (!date) return;
        setStartDate(date);
        if (endDate && date > endDate) {
            setEndDate(date);
        }
    };

    const handleEndDateChange = (date) => {
        if (!date) return;
        setEndDate(date);
        if (startDate && date < startDate) {
            setStartDate(date);
        }
    };

    const handleDownloadScreenshot = async () => {
        if (!historyTrendRef.current) return;

        // Show loader instantly by forcing synchronous update
        flushSync(() => {
            setScreenshotLoading(true);
        });

        // Use setTimeout to ensure React has rendered the loader before starting heavy work
        setTimeout(async () => {
            try {
                const canvas = await html2canvas(historyTrendRef.current, {
                    scale: window.devicePixelRatio || 1,
                    useCORS: true,
                    logging: false,
                });
                const link = document.createElement("a");
                link.href = canvas.toDataURL("image/png");
                link.download = `history-trend-${moment().format("YYYYMMDD-HHmmss")}.png`;
                link.click();
                toast.success("Screenshot downloaded successfully");
            } catch (error) {
                console.error("Screenshot capture failed:", error);
                toast.error("Unable to capture screenshot. Please try again.");
            } finally {
                setScreenshotLoading(false);
            }
        }, 0);
    };

    const fetchData = () => {
        if (values?.grpId?.value && values?.interval?.value) {
            // Get comma-separated tag IDs or null if none selected
            const tagIdValue = selectedTagIds.length > 0
                ? selectedTagIds.map(tag => tag.value).join(',')
                : null;

            let payload = {
                grpId: values?.grpId?.value,
                interval: values?.interval?.value,
                startDate: moment(startDate).format("YYYY-MM-DD HH:mm:ss"),
                endDate: moment(endDate).format("YYYY-MM-DD HH:mm:ss"),
                tagId: tagIdValue,
            }
            dispatch(
                HistorytrendData(payload)
            ).then((res) => {

                if (res?.payload?.status == 200) {
                    const rawData = res?.payload?.data;

                    const groupedData = rawData.reduce((acc, item) => {
                        if (!acc[item.itemId]) {
                            acc[item.itemId] = [];
                        }
                        acc[item.itemId].push({
                            value: item.itemValue,
                            timestamp: item.itemTimestamp
                        });
                        return acc;
                    }, {});

                    const uniqueTimestamps = [
                        ...new Set(rawData.map(item => item.itemTimestamp))
                    ].sort((a, b) => new Date(a) - new Date(b));


                    // const formattedSeries = Object.keys(groupedData).map((key, index) => {
                    //     const dataMap = new Map(
                    //         groupedData[key].map(item => [item.timestamp, item.value])
                    //     );
                    //     console.log("dataMap", key, dataMap)
                    //     // Map timestamps to data values (fill missing values with null)
                    //     const seriesData = uniqueTimestamps.map(ts => dataMap.get(ts)?.toFixed(2) || null);

                    //     return {
                    //         name: `${key}`, // Use itemId as the series name
                    //         data: seriesData,
                    //         color: colorList[index % colorList.length],
                    //     };
                    // });
                    const formattedSeries = Object.keys(groupedData).map((key, index) => {
                        const dataMap = new Map(
                            groupedData[key].map(item => [item.timestamp, item.value])
                        );

                        let lastValue = null;

                        const seriesData = uniqueTimestamps.map(ts => {
                            const value = dataMap.get(ts);
                            if (value !== undefined && value !== null) {
                                lastValue = value.toFixed(2);
                                return lastValue;
                            }
                            // If current timestamp missing, use last available value
                            return lastValue;
                        });

                        return {
                            name: `${key}`,
                            data: seriesData,
                            color: colorList[index % colorList.length],
                        };
                    });


                    // console.log("formattedSeries",  formattedSeries)

                    setState((prevState) => {
                        const updatedSeries = formattedSeries.map(series => ({
                            name: series.name,
                            data: series.data // Ensure this contains the updated data points
                        }));

                        const tagNames = updatedSeries?.map(tag => tag.name) || [];
                        const dynamicYaxes = generateDynamicYaxes(tagNames, colorList);

                        return {
                            ...prevState,
                            series: updatedSeries,
                            options: {
                                ...prevState.options,
                                colors: tagNames.map((_, idx) => colorList[idx % colorList.length]),
                                yaxis: dynamicYaxes,
                                // colors: formattedSeries.map(series => series.color),
                                xaxis: {
                                    type: "datetime",
                                    categories: uniqueTimestamps.map(ts => moment.utc(ts).format("YYYY-MM-DD HH:mm:ss")), // Dynamic x-axis labels
                                }
                            },
                            seriesLine: updatedSeries,
                            optionsLine: {
                                ...prevState.optionsLine,
                                colors: tagNames.map((_, idx) => colorList[idx % colorList.length]),
                                yaxis: dynamicYaxes,
                                // colors: formattedSeries.map(series => series.color),
                                xaxis: {
                                    type: "datetime",
                                    categories: uniqueTimestamps.map(ts => moment.utc(ts).format("YYYY-MM-DD HH:mm:ss")), // Dynamic x-axis labels

                                }
                            },
                        };
                    });



                }
            })
                .catch((err) => {
                    console.log(":err", err)
                    toast.error(err);
                });
        }
    };


    const DownloadReport = () => {
        setLoading(true)
          const tagIdValue = selectedTagIds.length > 0
            ? selectedTagIds.map(tag => tag.value).join(',')
            : null;
        let payload = {
            grpId: values?.grpId?.value,
            interval: values?.interval?.value,
            startDate: moment(startDate).format("YYYY-MM-DD HH:mm:ss"),
            endDate: moment(endDate).format("YYYY-MM-DD HH:mm:ss"),
            tagId:tagIdValue
        }
        dispatch(HistorytrendReportDownloadData(payload)).then((res) => {

            if (res?.payload) {
                const blob = new Blob([res.payload], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                });

                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${values?.grpId?.label}_HistoryTrendReport.xlsx`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
                setLoading(false)
            }

        }
        ).catch((err) => {
            console.log(":err", err)
            setLoading(false)
            toast.error(err);
        })
    }
    const getHistoryData = () => {
        setLoading(true)
        // Get comma-separated tag IDs or null if none selected
        const tagIdValue = selectedTagIds.length > 0
            ? selectedTagIds.map(tag => tag.value).join(',')
            : null;

        let payload = {
            grpId: values?.grpId?.value,
            startDate: moment(startDate).format("YYYY-MM-DD HH:mm:ss"),
            endDate: moment(endDate).format("YYYY-MM-DD HH:mm:ss"),
            tagId: tagIdValue,
        }
        dispatch(
            getHistoryDataList(payload)
        ).then((res) => {

            if (res.payload?.status == 200) {
                let data = res?.payload?.data
                setTableData(data)
                setLoading(false)
            }
        }).catch((err) => {
            toast.error(err);
            setLoading(false)
        })
    }

    useEffect(() => {
        if (startDate && endDate && values?.grpId?.value && values?.interval?.value && !apiCalled) {
            fetchData();
            getHistoryData();
            setApiCalled(true);
        }
    }, [values, apiCalled]);

    const handleApplyFilter = () => {
        if (startDate && endDate && values?.grpId?.value) {
            if (values?.interval?.value == 0) {
                toast.error("This interval filter not allowed")
                return
            }
            fetchData();
            getHistoryData();
        } else {
            toast.error("Please select all filter options.");
        }
    };

    return (
        <div className="page-content">
            {(loading || screenshotLoading) && <Loader />}
            <Container fluid>

                <Row>

                    {/* Main Content */}
                    <Col md="12">
                        {/* Chart Section */}
                        <div ref={historyTrendRef}>
                            <Card className="border border-gray shadow-sm mb-4">
                                <CardHeader className="bg-primary text-white d-flex flex-row justify-content-between">
                                    <div className="position-relative d-flex align-items-center">
                                        <span className="d-flex align-items-center gap-2  fs-5"><FaHistory size={24} />History Trend</span>
                                    </div>
                                    <div className="history-controls ms-auto">
                                        <div className="history-filter">
                                            <label className="filter-label">Start Date &amp; Time</label>
                                            <DatePicker
                                                selected={startDate}
                                                onChange={handleStartDateChange}
                                                showTimeSelect
                                                timeIntervals={15}
                                                timeCaption="Time"
                                                onKeyDown={(e) => e.preventDefault()}
                                                maxDate={new Date()}
                                                dateFormat="dd MMM yyyy hh:mm aa"
                                                className="form-control custom-datepicker"
                                                placeholderText="Select start date"
                                                wrapperClassName="w-100"
                                            />
                                        </div>
                                        <div className="history-filter">
                                            <label className="filter-label">End Date &amp; Time</label>
                                            <DatePicker
                                                selected={endDate}
                                                onChange={handleEndDateChange}
                                                showTimeSelect
                                                timeIntervals={15}
                                                timeCaption="Time"
                                                onKeyDown={(e) => e.preventDefault()}
                                                minDate={startDate}
                                                maxDate={new Date()}
                                                dateFormat="dd MMM yyyy hh:mm aa"
                                                className="form-control custom-datepicker"
                                                placeholderText="Select end date"
                                                wrapperClassName="w-100"
                                            />
                                        </div>
                                        <div className="history-filter">
                                            <label className="filter-label">Select Group</label>
                                            <Select options={groupdata} className="history-select" placeholder="Select Group" styles={singleSelectStyle} value={values?.grpId}
                                                onChange={(e) => {
                                                    setValues({
                                                        ...values,
                                                        grpId: e,
                                                    });
                                                    // Reset selected tags when group changes
                                                    setSelectedTagIds([]);
                                                }} />
                                        </div>
                                        <div className="history-filter-multi-select">
                                            <label className="filter-label">Select Tags</label>
                                            <Select
                                                isMulti
                                                isSearchable
                                                closeMenuOnSelect={false}
                                                hideSelectedOptions={false}
                                                options={tagOptions}
                                                className="history-select-multi"
                                                placeholder="Select Tags"
                                                styles={multiSelectStyle}
                                                value={selectedTagIds}
                                                onChange={(selectedOptions) => {
                                                    if (!selectedOptions) {
                                                        setSelectedTagIds([]);
                                                        return;
                                                    }

                                                    // Check if Select All was clicked
                                                    const hasSelectAll = selectedOptions.some(opt => opt.value === 'select-all');
                                                    const hasDeselectAll = selectedOptions.some(opt => opt.value === 'deselect-all');

                                                    if (hasSelectAll) {
                                                        // Select all tags (excluding select-all and deselect-all options)
                                                        const allTags = tagOptions.filter(opt => opt.value !== 'select-all' && opt.value !== 'deselect-all');
                                                        setSelectedTagIds(allTags);
                                                    } else if (hasDeselectAll) {
                                                        // Deselect all
                                                        setSelectedTagIds([]);
                                                    } else {
                                                        // Normal selection - filter out select-all and deselect-all
                                                        const filteredOptions = selectedOptions.filter(opt => opt.value !== 'select-all' && opt.value !== 'deselect-all');
                                                        setSelectedTagIds(filteredOptions);
                                                    }
                                                }}
                                                components={{
                                                    Option: CustomOption,
                                                    ValueContainer: CustomValueContainer,
                                                    MultiValue: () => null, // Hide individual selected items
                                                }}
                                            />
                                        </div>
                                        <div className="history-filter-main">
                                            <label className="filter-label">Sampling Interval</label>
                                            <Select options={intervaldata} className="history-select" placeholder="Select Interval" styles={singleSelectStyle} value={values?.interval}
                                                onChange={(e) => {
                                                    setValues({
                                                        ...values,
                                                        interval: e,
                                                    });
                                                }} />
                                        </div>
                                        <div className="history-actions position-relative">
                                            <Button className="togglebutton-design-off" onClick={handleApplyFilter}>Apply</Button>
                                            <div
                                                className=" border border-white rounded-3 px-2 py-2 d-inline-flex align-items-center"
                                                data-tooltip-id="downloadTooltip"
                                                data-tooltip-content="Download Report"
                                                onClick={() => DownloadReport()}
                                                style={{ cursor: "pointer" }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M13.5.5.5 3v18l13 2.5zM13.5 3.5h10v17h-10" />
                                                    <path d="M13.5 5.5h3v1h-3zM18.5 5.5h3v1h-3zM13.5 8.5h3v1h-3zM18.5 8.5h3v1h-3zM13.5 11.5h3v1h-3zM18.5 11.5h3v1h-3zM13.5 14.5h3v1h-3zM18.5 14.5h3v1h-3zM13.5 17.5h3v1h-3zM18.5 17.5h3v1h-3zM4.5 8.5l4 8M4.5 16.5l4-8" />
                                                </svg>
                                                <span className="mx-1 text-white">Export</span>
                                            </div>
                                            <Button
                                                color="light"
                                                className="history-action-btn "
                                                data-tooltip-id="screenshotTooltip"
                                                data-tooltip-content="Take Screenshot"
                                                onClick={handleDownloadScreenshot}
                                            >
                                                <FaCamera className="" />
                                            </Button>
                                            <Tooltip id="downloadTooltip" />
                                            <Tooltip id="screenshotTooltip" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardBody>

                                    <ReactApexChart options={state.options} series={state.series} type="line" height={400} />
                                    <ReactApexChart options={state.optionsLine} series={state.seriesLine} type="area" height={170} />
                                </CardBody>
                            </Card>
                        </div>

                        {/* Table Section */}
                        <Card className="border border-gray shadow-sm">
                            <CardHeader className="bg-primary text-white  fs-5 ">Tag Details of Selected Tags & TimeSpan</CardHeader>
                            <CardBody>

                                <div >
                                    <Table striped responsive>
                                        <thead >
                                            <tr>
                                                <th>Tag Name</th>

                                                <th>Current Value</th>
                                                <th>Minimum</th>
                                                <th>Maximum</th>
                                                <th>Average</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tableData.map((row, index) => (
                                                <tr key={index}>
                                                    <td>{row.itemId}</td>

                                                    <td>{row?.itemValue}</td>
                                                    <td>{row.minValue}</td>
                                                    <td>{row.maxValue}</td>
                                                    <td>{row.avgValue}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default HistoryTrend;