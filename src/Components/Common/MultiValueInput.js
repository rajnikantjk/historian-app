import React, { useState } from "react";

const MultiValueInput = ({ enteredValues, setEnteredValues }) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [currentValue, setCurrentValue] = useState("");

  const handleInputChange = (e) => {
    setCurrentValue(e.target.value);
    setErrorMessage("");
  };
  const handleKeyDown = (e) => {
    const data =
      Array.isArray(enteredValues) &&
      enteredValues?.find(
        (item) => item?.toLowerCase() == currentValue?.toLowerCase()
      );
    if (e.key === "Enter" && currentValue?.trim() !== "" && !data) {
      setEnteredValues([...enteredValues, currentValue.trim()]);
      setCurrentValue("");
    }
  };

  const handleRemove = (valueToRemove) => {
    const filteredValues = enteredValues?.filter(
      (value) => value !== valueToRemove
    );
    setEnteredValues(filteredValues);
  };

  return (
    <div>
      <div
        className="input-group"
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          border: "1px solid #ced4da",
          borderRadius: ".25rem",
          padding: ".375rem .75rem",
        }}
      >
        {Array.isArray(enteredValues) &&
          enteredValues?.map((value, index) => (
            <span
              key={index}
              className="badge bg-primary me-2 mb-2"
              style={{
                display: "inline-flex",
                alignItems: "center",
                borderRadius: ".25rem",
                fontSize: "12px",
              }}
            >
              {value}
              <span
                className="ms-2 cursor-pointer"
                onClick={() => handleRemove(value)}
                style={{ cursor: "pointer", marginLeft: "5px" }}
              >
                &times;
              </span>
            </span>
          ))}
        <input
          type="text"
          className="form-control border-0 p-0"
          id="custom-input"
          value={currentValue}
          placeholder={enteredValues.length === 0 ? "Enter meta keywords" : ""}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          style={{ flex: "1", minWidth: "150px" }}
        />
      </div>
      {errorMessage && <div className="text-danger mt-2">{errorMessage}</div>}
    </div>
  );
};

export default MultiValueInput;
