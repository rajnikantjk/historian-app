import React from "react";

const LiveStatusDot = ({ isLive }) => {
  return (
    <div
      className={`w-3 h-3 rounded-full ${
        isLive ? "bg-green" : "bg-red"
      } animate-ping`}
      style={{
        width: "12px",
        height: "12px",
        backgroundColor: isLive ? "#24ee24" : "#dc3545",
        borderRadius: "50%",
        animation: "pulse 1.5s infinite",
        border: "1px solid white",
      }}
    ></div>
  );
};

export default LiveStatusDot;