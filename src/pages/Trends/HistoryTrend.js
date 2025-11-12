

import React, { useEffect, useState } from "react";
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
import { getHistoryDataList, getIntervalList, getTagGroupList, HistorytrendData, HistorytrendReportDownloadData } from "../../slices/tools";
import moment from "moment";
import { Tooltip } from "react-tooltip";
import { FaDownload, FaHistory } from "react-icons/fa";
import { FaFileExcel } from "react-icons/fa";
import Loader from "../../Components/Common/Loader";
import { toast } from "react-toastify";
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
const HistoryTrend = () => {
    const { toolSubCategoryData, intervalData } = useSelector(
        (state) => state.Tool)
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [dateRange, setDateRange] = useState([
        new Date(),
        new Date()
    ]);
    const [startDate, endDate] = dateRange;
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("taglist");
    const [selectedTags, setSelectedTags] = useState([]);
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
            chart: { type: "line", height: 650, toolbar: { show: false } },
            stroke: { width: 3, curve: "smooth" },
            tooltip: {
                x: {
                    format: 'dd MMM yyyy HH:mm:ss', // 👈 Tooltip datetime format
                }
                },
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
    });

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
    }).filter((data) => data != undefined).concat([{ label: "All", value: 0 }]);

    const groupdata = toolSubCategoryData.map((item) => {
        return {
            value: item?.id,
            label: item?.grpName,
        };
    });
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

    const handleOnChange = (dates) => {
        const [start, end] = dates;
        setDateRange([
            start,
            end
        ]);
        if (start && end) {
            setIsOpen(false); // Close the datepicker once both are selected
        }
    };

    const fetchData = () => {
        if (values?.grpId?.value && values?.interval?.value) {

            let payload = {
                grpId: values?.grpId?.value,
                interval: values?.interval?.value,
                startDate: moment(startDate).format("YYYY-MM-DD"),
                endDate: moment(endDate).format("YYYY-MM-DD"),
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


                    console.log("formattedSeries",  formattedSeries)

                    setState((prevState) => {
                        const updatedSeries = formattedSeries.map(series => ({
                            name: series.name,
                            data: series.data // Ensure this contains the updated data points
                        }));



                        return {
                            ...prevState,
                            series: updatedSeries,
                            options: {
                                ...prevState.options,
                                colors: formattedSeries.map(series => series.color),
                                xaxis: {
                                    type: "datetime",
                                    categories: uniqueTimestamps.map(ts => moment.utc(ts).format("YYYY-MM-DD HH:MM:SS")), // Dynamic x-axis labels
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
        let payload = {
            grpId: values?.grpId?.value,
            interval: values?.interval?.value,
            startDate: moment(startDate).format("YYYY-MM-DD"),
            endDate: moment(endDate).format("YYYY-MM-DD"),
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
        let payload = {
            grpId: values?.grpId?.value,
            startDate: moment(startDate).format("YYYY-MM-DD"),
            endDate: moment(endDate).format("YYYY-MM-DD"),
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
            {loading && <Loader />}
            <Container fluid>

                <Row>

                    {/* Main Content */}
                    <Col md="12">
                        {/* Chart Section */}
                        <Card className="border border-gray shadow-sm mb-4">
                            <CardHeader className="bg-primary text-white d-flex justify-content-between">
                                <div className="position-relative d-flex align-items-center">
                                    <span className="d-flex align-items-center gap-2  fs-5"><FaHistory size={24} />History Trend</span>
                                </div>
                                <div className=" position-relative d-flex align-items-center gap-2 ms-auto download-icon-align">

                                    <DatePicker
                                        selectsRange
                                        selected={startDate}
                                        startDate={startDate}
                                        endDate={endDate}
                                        onChange={handleOnChange}
                                        shouldCloseOnSelect={true}
                                        onKeyDown={(e) => e.preventDefault()}
                                        fixedHeight
                                        maxDate={new Date()}
                                        dateFormat="dd MMMM yyyy"
                                        className="form-control custom-datepicker"
                                        placeholderText="Select date range"
                                        style={{ width: "100%" }}

                                    />
                                    <label className="text-white mb-1 d-block text-center">Select Group :</label>
                                    <Select options={groupdata} className="w-[200px] min-w-[200px]" placeholder="Select Group" styles={singleSelectStyle} value={values?.grpId}
                                        onChange={(e) => {
                                            setValues({
                                                ...values,
                                                grpId: e,
                                            });
                                        }} />
                                    <label className="text-white mb-1 d-block text-center">Select Interval :</label>
                                    <Select options={intervaldata} className="select-menu-align" placeholder="Select Interval" styles={singleSelectStyle} value={values?.interval}
                                        onChange={(e) => {
                                            setValues({
                                                ...values,
                                                interval: e,
                                            });
                                        }} />
                                    <Button className="togglebutton-design-off" onClick={handleApplyFilter}>Apply</Button>
                                    <div className=" d-flex align-items-center ">
                                        <div
                                            className="ms-1 border border-white rounded-3 px-2 py-2"
                                            data-tooltip-id="downloadTooltip"
                                            data-tooltip-content="Download Report"
                                            onClick={() => DownloadReport()}
                                            style={{ position: "absolute", right: "-95px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", zIndex: 1 }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M13.5.5.5 3v18l13 2.5zM13.5 3.5h10v17h-10" />
                                                <path d="M13.5 5.5h3v1h-3zM18.5 5.5h3v1h-3zM13.5 8.5h3v1h-3zM18.5 8.5h3v1h-3zM13.5 11.5h3v1h-3zM18.5 11.5h3v1h-3zM13.5 14.5h3v1h-3zM18.5 14.5h3v1h-3zM13.5 17.5h3v1h-3zM18.5 17.5h3v1h-3zM4.5 8.5l4 8M4.5 16.5l4-8" />
                                            </svg>
                                            <span className="mx-1">Export</span>
                                        </div>
                                        <Tooltip id="downloadTooltip" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardBody>

                                <Chart options={state.options} series={state.series} type="line" height={400} />
                            </CardBody>
                        </Card>

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