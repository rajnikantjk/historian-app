import ApexCharts from "apexcharts"
import React, { useEffect, useRef, useState } from "react";
import ReactApexChart from "react-apexcharts";
import {
  Card,
  CardBody,
  CardHeader,

  Container,
  Row,
  Col,

} from "reactstrap";
import { getFrequencyList, getIntervalList, getTagGroupList, LivetrandGetData, LivetrandReportDownloadData } from "../../slices/tools";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Select from "react-select";
import moment from "moment";
import { Tooltip } from "react-tooltip";
import { FaDownload } from "react-icons/fa";
import { FaFileExcel } from "react-icons/fa";
import Loader from "../../Components/Common/Loader";
import { FaPlay, FaPause } from "react-icons/fa";
import LiveStatusDot from "./LiveStatusDot";
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
const LiveTrend = () => {
  let intervalId = null;
  const dispatch = useDispatch();
  const [isLive, setIsLive] = useState(true);
  const [livedata, setLiveData] = useState([])
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(false);
  const { toolSubCategoryData, intervalData, frequencyData } = useSelector(
    (state) => state.Tool)

  const colorList = [
    "#008FFB", "#00E396", "#FEB019", "#FF4560", "#775DD0",
    "#546E7A", "#26a69a", "#D10CE8", "#ff6384", "#36a2eb"
  ];
  const groupdata = toolSubCategoryData.map((item) => {
    return {
      value: item?.id,
      label: item?.grpName,
    };
  });

  const frequencydata = frequencyData.map((item) => {
    return {
      value: item?.value,
      label: item?.key,
    };
  });


  const intervaldata = intervalData?.map((item) => {
    return {
      value: item?.value,
      label: item?.key,
    };
  });


  const [state, setState] = React.useState({

    series: [{
      name: '',
      data: []
    }, {
      name: 'Tag Value',
      data: []
    }],
    options: {
      chart: {
        id: 'chart2',
        type: 'line',
        height: 230,
        animations: {
          enabled: false,
          easing: 'linear', // Smooth transition effect
          dynamicAnimation: {
            speed: 100000 // Adjust speed of the transition
          }
        },
        dropShadow: {
          enabled: true,
          enabledOnSeries: [1]
        },
        toolbar: {
          autoSelected: 'pan',
          show: false
        }
      },
      colors: colorList,
      stroke: {
        width: 3
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        width: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,],
        curve: ['smooth', 'smooth', 'smooth', 'smooth', 'smooth', 'smooth', 'smooth', 'smooth', 'smooth', 'smooth', 'smooth', 'smooth', 'smooth', 'smooth', 'smooth', 'smooth', 'smooth', 'smooth',]
      },
      fill: {
        opacity: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,],
      },
      markers: {
        size: 0
      },
      tooltip: {
        x: {
          format: 'dd MMM yyyy HH:mm:ss', // 👈 Tooltip datetime format
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

      }
    },

    seriesLine: [{
      name: '',
      data: []
    }, {
      name: 'Tag Value',
      data: []
    }],
    optionsLine: {
      chart: {
        id: 'chart1',
        height: 130,
        type: 'line',
        brush: {
          target: 'chart2',
          enabled: true
        },
        selection: {
          enabled: true,
          //   xaxis: {
          //     min: new Date('24 April 2017').getTime(),
          //     max: new Date('29 May 2017').getTime()
          //   }
        },
      },
      colors: colorList,
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
      yaxis: {
        max: 100,
        tickAmount: 2
      }
    },


  });

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
    if (frequencyData.length > 0 && !values.frequency) {
      setValues(prevValues => ({
        ...prevValues,
        frequency: {
          value: frequencyData[1]?.value,
          label: frequencyData[1]?.key
        }
      }));
    }
  }, [frequencyData]);
  useEffect(() => {
    Promise.all([
      dispatch(getTagGroupList()),
      dispatch(getIntervalList()),
      dispatch(getFrequencyList())
    ]);
  }, [dispatch]);

  const fetchData = () => {
    if (values?.grpId?.value && values?.interval?.value) {
      let payload = {
        grpId: values?.grpId?.value,
        // interval:"1098 Minute"
        interval: values?.interval?.label
      }
      dispatch(
        LivetrandGetData(payload)
      ).then((res) => {
        if (res?.payload?.status == 200) {
          const rawData = res?.payload?.data;
          //   if(rawData?.length== 0){
          //     toast.error("No Data Found")
          // }
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
          setLiveData({ rawData })
          const uniqueTimestamps = [
            ...new Set(rawData.map(item => item.itemTimestamp))
          ].sort((a, b) => new Date(a) - new Date(b));


          const formattedSeries = Object.keys(groupedData).map((key, index) => {
            const dataMap = new Map(
              groupedData[key].map(item => [item.timestamp, item.value])
            );

            // Map timestamps to data values (fill missing values with null)
            const seriesData = uniqueTimestamps.map(ts => dataMap.get(ts)?.toFixed(2) || 0);

            return {
              name: `${key}`, // Use itemId as the series name
              data: seriesData,
              color: colorList[index % colorList.length],
            };
          });

          // console.log("seriesData",formattedSeries, uniqueTimestamps)

          setState((prevState) => {
            const updatedSeries = formattedSeries.map(series => ({
              name: series.name,
              data: series.data // Ensure this contains the updated data points
            }));

            const updatedSeriesLine = formattedSeries.map(series => ({
              name: series.name,
              data: series.data // Ensure this contains the updated data points
            }));

            // Smoothly update chart
            // ApexCharts.exec("realtime", "updateSeries", updatedSeries);
            // ApexCharts.exec("realtime", "updateSeries", updatedSeriesLine);

            return {
              ...prevState,
              series: updatedSeries,
              seriesLine: updatedSeriesLine,
              options: {
                ...prevState.options,
                colors: formattedSeries.map(series => series.color),
                xaxis: {
                  type: "datetime",
                  categories: uniqueTimestamps.map(ts => moment.utc(ts).toISOString()), // Dynamic x-axis labels
                }
              },
              optionsLine: {
                ...prevState.optionsLine,
                colors: formattedSeries.map(series => series.color),
                xaxis: {
                  type: "datetime",
                  categories: uniqueTimestamps.map(ts => moment.utc(ts).toISOString()) // Dynamic x-axis labels
                }
              }
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

  useEffect(() => {
    if (intervalId) {
      clearInterval(intervalId); // Clear the old interval before setting a new one
    }

    if (values?.frequency?.value && isLive) {
      // fetchData(); // Initial API call
      setTimeout(() => {
        sendParameters();
      }, 100)


      intervalId = setInterval(() => {
        // fetchData();
      }, values.frequency.value * 1000); // Convert seconds to milliseconds
    }

    return () => {
      clearInterval(intervalId); // Cleanup when frequency changes or component unmounts
    };
  }, [isLive, values?.frequency?.value, values?.grpId?.value, values?.interval?.value]);
  console.log("values", values)
  const DownloadReport = () => {
    setLoading(true)
    let payload = {
      grpId: values?.grpId?.value,
      interval: values?.interval?.value
    }
    dispatch(LivetrandReportDownloadData(payload)).then((res) => {

      if (res?.payload) {
        const blob = new Blob([res.payload], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${values?.grpId?.label}_LiveTrendReport.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        setLoading(false)
      }

    }
    ).catch((err) => {
      console.log(":err", err)
      toast.error(err);
      setLoading(false)
    })
  }


  const socketRef = useRef(null);

  // Function to initialize the WebSocket
  const initializeSocket = () => {
    socketRef.current = new WebSocket(`${process.env.REACT_APP_API_URL}live/trend/tag`);

    socketRef.current.onopen = () => {
      console.log('WebSocket connection established');

    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      setState((prevState) => {


        return {
          ...prevState,
          series: data?.tagdata || [],
          seriesLine: data?.tagdata || [],
          options: {
            ...prevState.options,
            // colors: formattedSeries.map(series => series.color),
            xaxis: {
              type: "datetime",
              categories: data?.timestamp || [], // Dynamic x-axis labels
            }
          },
          optionsLine: {
            ...prevState.optionsLine,
            // colors: formattedSeries.map(series => series.color),
            xaxis: {
              type: "datetime",
              categories: data?.timestamp || [] // Dynamic x-axis labels
            }
          }
        };
      });

    };

    socketRef.current.onclose = () => {
      console.log('WebSocket connection closed');
    };

    socketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  useEffect(() => {
    initializeSocket();

    // Cleanup on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const sendParameters = () => {

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      const params = {
        interval: values?.interval?.value,
        grpId: values?.grpId?.value,
        frequency: values?.frequency?.value,
      };

      console.log("params", params)

      socketRef.current.send(JSON.stringify(params));
    }
  };

  const stopData = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ action: 'STOP' }));
    }
  };

  const handleToggle = () => {
    if (isLive) {
      stopData()
    } else {
      sendParameters()
    }
    setIsLive(!isLive)

  }
  return (
    <div className="page-content">
      {loading && <Loader />}
      <Container fluid>
        <Row>

          {/* Main Content */}
          <Col md="12">
            {/* Chart Section */}
            <Card className="border border-gray shadow-sm mb-4">
              <CardHeader className="bg-primary text-white d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2 ">
                  <span className="d-flex align-items-center gap-2 fs-5"><LiveStatusDot isLive={isLive} /> Live Trend</span>
                  <div className="position-relative d-flex align-items-center">
                    <div
                      className={isLive ? "togglebutton-design" : "togglebutton-design-off"}
                      onClick={() => handleToggle()}
                      style={{ zIndex: 2 }}
                    >
                      {isLive ? (
                        <FaPause size={14} />
                      ) : (
                        <FaPlay size={14} />
                      )}

                    </div>

                  </div>


                </div>
                <div className="position-relative d-flex align-items-center gap-2 download-icon-align">

                  <label className="text-white mb-1 d-block text-center">Group :</label>
                  <Select options={groupdata} className="w-[200px] min-w-[200px]" placeholder="Select Group" styles={singleSelectStyle} value={values?.grpId}
                    onChange={(e) => {
                      setValues({
                        ...values,
                        grpId: e,
                      });
                    }} />
                  <label className="text-white mb-1 d-block">Interval :</label>
                  <Select options={intervaldata} className="w-[100px]" placeholder="Select Interval" styles={singleSelectStyle} value={values?.interval}
                    onChange={(e) => {
                      setValues({
                        ...values,
                        interval: e,
                      });
                    }} />
                  <label className="text-white mb-1 d-block">Frequency :</label>
                  <Select options={frequencydata} className="w-[100px]" placeholder="Select Frequency" styles={singleSelectStyle} value={values?.frequency}
                    onChange={(e) => {
                      setValues({
                        ...values,
                        frequency: e,
                      });
                    }} />
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
                <ReactApexChart options={state.options} series={state.series} type="line" height={430} />
                <ReactApexChart options={state.optionsLine} series={state.seriesLine} type="area" height={170} />
              </CardBody>
            </Card>


          </Col>
        </Row>

      </Container>
    </div>
  );
};

export default LiveTrend;