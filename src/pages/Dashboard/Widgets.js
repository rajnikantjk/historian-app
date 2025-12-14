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
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
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
  const initialSpeedometerData = [
    { itemId: "Random.Int1", itemValue: 65, minValue: 0, maxValue: 100 },
    { itemId: "Random.UInt1", itemValue: 40, minValue: 0, maxValue: 100 },
    { itemId: "Saw-toothed Waves.UInt1", itemValue: 85, minValue: 0, maxValue: 120 },
    { itemId: "Triangle Waves.Int1", itemValue: 25, minValue: 0, maxValue: 100 },
    { itemId: "Sine Waves.Int1", itemValue: 55, minValue: 0, maxValue: 90 },
    { itemId: "Cosine Waves.UInt1", itemValue: 72, minValue: 10, maxValue: 110 },
    { itemId: "Square Waves.Int1", itemValue: 33, minValue: 0, maxValue: 95 },
    { itemId: "Ramp Waves.UInt1", itemValue: 95, minValue: 20, maxValue: 130 },
    { itemId: "Pulse Waves.Int1", itemValue: 15, minValue: 0, maxValue: 80 },
    { itemId: "Noise Waves.UInt1", itemValue: 48, minValue: 5, maxValue: 105 },
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
        const shouldShowYAxis = tagNames.length === 1 
    return tagNames.map((tagName, index) => ({
      seriesName: tagName,
      show: shouldShowYAxis,
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
    socketRef.current = new WebSocket(`${process.env.REACT_APP_API_URL}live/tag-wise`);

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
      grpId: "",
      startDate: moment(new Date()).startOf('day').format("YYYY-MM-DD HH:mm:ss"),
      endDate: moment(new Date()).endOf('day').format("YYYY-MM-DD HH:mm:ss"),
      tagId: null,
       defaultLoad:"Y"
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

        defaultLoad:"Y",
       
      };

      // console.log("params", params)

      socketRef.current.send(JSON.stringify(params));
    }
  };
  const sendMeterPrameters = () => {
    if (secondarySocketRef.current?.readyState === WebSocket.OPEN) {
      const params = {
        defaultLoad:"Y",
      };

      // console.log("params2", params)

      secondarySocketRef.current.send(JSON.stringify(params));
    }
  }
  return (
    <React.Fragment>
      {loading && <Loader />}
      <Container fluid>
        <Row className="">
          {speedometerDatas?.length > 4 ? (
            <Col xs="12">
              <Swiper
                modules={[Navigation]}
                navigation
                spaceBetween={16}
                slidesPerGroup={2}
                breakpoints={{
                  0: { slidesPerView: 1 },
                  576: { slidesPerView: 1 },
                  768: { slidesPerView: 2 },
                  992: { slidesPerView: 3 },
                  1200: { slidesPerView: 4 },
                }}
                className="speedometer-slider"
              >
                {speedometerDatas.map((item, index) => (
                  <SwiperSlide key={item?.itemId ?? index}>
                    <Card className="w-100 h-100">
                      <CardBody className="text-start">
                        <h5 className="mb-4">{item.itemId}</h5>
                        <div className="d-flex justify-content-center">
                          <ReactSpeedometer
                            maxValue={item?.maxValue}
                            value={item?.itemValue}
                            minValue={item?.minValue}
                            needleColor="steelblue"
                            startColor="green"
                            endColor="red"
                            height={180}
                          />
                        </div>
                      </CardBody>
                    </Card>
                  </SwiperSlide>
                ))}
              </Swiper>
            </Col>
          ) : (
            speedometerDatas?.map((item, index) => (
              <Col
                xs="12"
                sm="12"
                md="6"
                lg="3"
                key={item?.itemId ?? index}
                className="d-flex justify-content-center"
              >
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
                        endColor="red"
                        height={180}
                      />
                    </div>
                  </CardBody>
                </Card>
              </Col>
            ))
          )}
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
                       <th>Eng Unit</th>
                       <th>Description</th>
                        <th>Current Value</th>
                        <th>Standard Division Value</th>
                        <th>Minimum</th>
                        <th>Maximum</th>
                        <th>Average</th>
                        
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((row, index) => (
                        <tr key={index}>
                          <td>{row.itemId}</td>
                          <td>{row.unitName}</td>
                           <td>{row.description}</td>
                          <td>{row?.itemValue}</td>
                          <td>{row?.stdDevValue}</td>
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






