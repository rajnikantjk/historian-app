import React from 'react';

//import Scss
import "bootstrap/dist/css/bootstrap.min.css";
import "react-datepicker/dist/react-datepicker.css";

import './assets/scss/themes.scss';
import "./App.css"

//imoprt Route
import Route from './Routes';
import { ToastContainer } from 'react-toastify';


function App() {
  return (
    <React.Fragment>
      <ToastContainer  position={"bottom-right"} />

      <Route />
    </React.Fragment>
  );
}

export default App;
