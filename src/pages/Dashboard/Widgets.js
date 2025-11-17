import React, { useEffect, useRef, useState } from "react";
import { Container, Row, Col, Card, CardBody, CardHeader, Table } from "reactstrap";
import ReactSpeedometer from "react-d3-speedometer";
import { useDispatch, useSelector } from "react-redux";
import { getFrequencyList, getHistoryDataList, getIntervalList, getTagGroupList } from "../../slices/tools";
import ReactApexChart from "react-apexcharts";
import LiveStatusDot from "../Trends/LiveStatusDot";
import moment from "moment";
import { toast } from "react-toastify";
import Loader from "../../Components/Common/Loader";
const Widgets = () => {
  const dispatch = useDispatch();
  const [livedata, setLiveData] = useState([])
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState({});
  const [tableData, setTableData] = useState([]);
  const colorList = [
    "#008FFB", "#00E396", "#FEB019", "#FF4560", "#775DD0",
    "#546E7A", "#26a69a", "#D10CE8", "#ff6384", "#36a2eb"
  ];
  const [speedometerDatas, setSpeedometerDatas] = useState([])
  const socketRef = useRef(null);
  const secondarySocketRef = useRef(null);
  const [secondSocketInitialized, setSecondSocketInitialized] = useState(false);
  const { toolSubCategoryData, intervalData, frequencyData } = useSelector(
    (state) => state.Tool)
  // console.log("speedometerDatas",speedometerDatas)
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
  const speedometerData = [
    { label: "Random.Int1", value: 65 },
    { label: "Random.UInt1", value: 40 },
    { label: "Saw-toothed Waves.UInt1", value: 85 },
    { label: "Triangle Waves.Int1", value: 25 },
  ];
  // console.log("secondSocketInitialized",secondSocketInitialized)
  const connectSecondarySocket = () => {
    secondarySocketRef.current = new WebSocket(`${process.env.REACT_APP_API_URL}live/meter/tag-wise`);

    secondarySocketRef.current.onopen = () => {
      console.log('Secondary WebSocket connected');
    };

    secondarySocketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setSpeedometerDatas(data)

    };

    secondarySocketRef.current.onclose = () => {
      console.log('Secondary WebSocket closed');
    };

    secondarySocketRef.current.onerror = (error) => {
      console.error('Secondary WebSocket error:', error);
    };
  };


  // Function to initialize the WebSocket
  const initializeSocket = () => {
    socketRef.current = new WebSocket(`${process.env.REACT_APP_API_URL}live/tag-wise-new`);

    socketRef.current.onopen = () => {
      console.log('WebSocket connection established');

    };

    socketRef.current.onmessage = (event) => {
      // const data = JSON.parse(event.data);
      const rawData = JSON.parse(event?.data);

      // Step 1: Collect all unique tag names
      const allTagNames = Array.from(
        new Set(rawData.flatMap(entry => entry.tagdata.map(t => t.name)))
      );

      // Step 2: Sort data chronologically
      const sortedData = rawData.sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );

      // Step 3: Fill missing values using previous values or null
      const filledData = sortedData.reduce((acc, curr, idx) => {
        const currMap = new Map(curr.tagdata.map(t => [t.name, t.value]));
        const prevMap =
          idx > 0 ? new Map(acc[idx - 1].tagdata.map(t => [t.name, t.value])) : new Map();

        // Build complete tagdata ensuring all names exist
        const filledTags = allTagNames.map(name => {
          if (currMap.has(name)) {
            // use current value
            return { name, value: currMap.get(name) };
          } else if (prevMap.has(name)) {
            // fallback to previous timestamp value
            return { name, value: prevMap.get(name) };
          } else {
            // not available anywhere before
            return { name, value: null };
          }
        });

        acc.push({
          ...curr,
          tagdata: filledTags,
        });

        return acc;
      }, []);

      const convertFilledData = (filledData) => {
        // Collect all unique tag names
        const allTagNames = Array.from(
          new Set(filledData.flatMap(item => item.tagdata.map(t => t.name)))
        );

        // Create a unique timestamp array (no repeats)
        const timestamp = filledData.map(item => item.timestamp);

        // Build tag-wise data arrays
        const tagdata = allTagNames.map(tagName => ({
          name: tagName,
          data: filledData.map(item => {
            const tag = item.tagdata.find(t => t.name === tagName);
            return tag?.value ?? null;
          })
        }));

        return { timestamp, tagdata };
      };

      // Example usage:
      const transformed = convertFilledData(filledData);

      setState((prevState) => {
        // const updatedSeries = formattedSeries.map(series => ({
        //   name: series.name,
        //   data: series.data // Ensure this contains the updated data points
        // }));


        const tagNames = transformed?.tagdata?.map(tag => tag.name) || [];
        const dynamicYaxes = generateDynamicYaxes(tagNames, colorList);

        return {
          ...prevState,
          series: transformed?.tagdata || [],
          options: {
            ...prevState.options,
            colors: tagNames.map((_, idx) => colorList[idx % colorList.length]),
            yaxis: dynamicYaxes, // Dynamic y-axes based on tags
            // colors: formattedSeries.map(series => series.color),
            xaxis: {
              type: "datetime",
              categories: transformed?.timestamp || [], // Dynamic x-axis labels
            }
          },

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
    connectSecondarySocket();
    // Cleanup on component unmount
    return () => {
      if (socketRef.current || secondarySocketRef.current) {
        socketRef.current.close();
        secondarySocketRef.current?.close();
      }
    };
  }, []);

  useEffect(() => {
    if (values?.frequency?.value) {
      setTimeout(() => {
        sendParameters();
        sendMeterPrameters();
        getHistoryData()
      }, 100)
    }


  }, [values?.frequency?.value, values?.grpId?.value, values?.interval?.value]);
  const getHistoryData = () => {
    setLoading(true)
    let payload = {
      grpId: values?.grpId?.value,
      startDate: moment(new Date()).format("YYYY-MM-DD"),
      endDate: moment(new Date()).format("YYYY-MM-DD"),
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

  const sendParameters = () => {

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      const params = {
        interval: values?.interval?.value,
        grpId: values?.grpId?.value,
        frequency: 30 // set for delhi client
        // frequency: values?.frequency?.value, //on request of prakashbhai
      };

      // console.log("params", params)

      socketRef.current.send(JSON.stringify(params));
    }
  };
  const sendMeterPrameters = () => {
    if (secondarySocketRef.current?.readyState === WebSocket.OPEN) {
      const params = {
        grpId: values?.grpId?.value,
        frequency: values?.frequency?.value,
      };

      // console.log("params2", params)

      secondarySocketRef.current.send(JSON.stringify(params));
    }
  }
  return (
    <React.Fragment>
      {loading && <Loader />}
      <Container fluid>
        <Row>
          {speedometerDatas?.map((item, index) => (
            <Col xs="12"
              sm="12"
              md="6"
              lg="3" key={index} className=" d-flex justify-content-center">
              <Card className="w-100">
                <CardBody className="text-start">
                  <h5 className="mb-4">{item.itemId}</h5>
                  <div className="d-flex justify-content-center">
                    <ReactSpeedometer
                      maxValue={item?.maxValue}
                      value={item?.itemValue}
                      minValue={item?.minValue}
                      needleColor="steelblue"
                      startColor="green"
                      // segments={10}
                      endColor="red"
                      height={180}

                    />
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
        <Row>
          <Col md="12">
            <Card className="border border-gray shadow-sm mb-4">
              <CardHeader className="bg-primary text-white d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2 ">
                  <span className="d-flex align-items-center gap-2 fs-5"><LiveStatusDot isLive={true} /> Live Trend</span>
                </div>
              </CardHeader>
              {/* <CardBody> */}
              <ReactApexChart options={state.options} series={state.series} type="line" height={430} />
              {/* </CardBody> */}
            </Card>
          </Col>
        </Row>
        <Row>
          <Col>
            <Card className="border border-gray shadow-sm">
              <CardHeader className="bg-primary text-white  fs-5 ">Tag Details</CardHeader>
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
    </React.Fragment>
  );
};

export default Widgets;






