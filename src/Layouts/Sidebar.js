import React, { useEffect,useState } from "react";
import { Link } from "react-router-dom";
import SimpleBar from "simplebar-react";
//import logo
import logoSm from "../assets/images/iconlogo.svg";
import logoDark from "../assets/images/lightfullogo.png";
import logoLight from "../assets/images/lightfullogo.png";

//Import Components
import VerticalLayout from "./VerticalLayouts";
import { Container } from "reactstrap";
import { useDispatch } from "react-redux";
import { getCompanyLogo } from "../slices/tools";

const Sidebar = ({ layoutType }) => {
  const [companyLogo,setCompanyLogo] = useState("")
  const [smallLogo,setSmallLogo] = useState("")
  const dispatch=useDispatch()

  useEffect(()=>{
    dispatch(getCompanyLogo()).then((res)=>{
      setCompanyLogo(res?.payload?.[0]?.siderbarLogo)
      setSmallLogo(res?.payload?.[0]?.smallIconLogo)
    })

  },[])

  useEffect(() => {
    var verticalOverlay = document.getElementsByClassName("vertical-overlay");
    if (verticalOverlay) {
      verticalOverlay[0].addEventListener("click", function () {
        document.body.classList.remove("vertical-sidebar-enable");
      });
    }
  });

  const addEventListenerOnSmHoverMenu = () => {
    // add listener Sidebar Hover icon on change layout from setting
    if (document.documentElement.getAttribute('data-sidebar-size') === 'sm-hover') {
      document.documentElement.setAttribute('data-sidebar-size', 'sm-hover-active');
    } else if (document.documentElement.getAttribute('data-sidebar-size') === 'sm-hover-active') {
      document.documentElement.setAttribute('data-sidebar-size', 'sm-hover');
    } else {
      document.documentElement.setAttribute('data-sidebar-size', 'sm-hover');
    }
  };

  return (
    <React.Fragment>
      <div className="app-menu navbar-menu">
        <div className="navbar-brand-box">
          <Link to="/" className="logo logo-dark">
            <span className="logo-sm">
              <img 
                src={smallLogo ? `data:image/png;base64,${smallLogo}` : logoSm} 
                alt="Company Logo" 
                height="62" 
              />
            </span>
            <span className="logo-lg">
              <img 
                src={companyLogo ? `data:image/png;base64,${companyLogo}` : logoDark} 
                alt="Company Logo" 
                height="100" 
                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
              />
            </span>
          </Link>

          <Link to="/" className="logo logo-light">
            <span className="logo-sm">
              <img 
                src={smallLogo ? `data:image/png;base64,${smallLogo}` : logoSm} 
                alt="Company Logo" 
                height="62" 
              />
            </span>
            <span className="logo-lg">
              <img 
                src={companyLogo ? `data:image/png;base64,${companyLogo}` : logoLight} 
                alt="Company Logo" 
                height="100" 
                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
              />
            </span>
          </Link>
          <button
            onClick={addEventListenerOnSmHoverMenu}
            type="button"
            className="btn btn-sm p-0 fs-20 header-item float-end btn-vertical-sm-hover"
            id="vertical-hover"
          >
            <i className="ri-record-circle-line"></i>
          </button>
        </div>
          <React.Fragment>
            <SimpleBar id="scrollbar" className="h-100">
              <Container fluid>
                <div id="two-column-menu"></div>
                <ul className="navbar-nav" id="navbar-nav">
                  <VerticalLayout layoutType={layoutType} />
                </ul>
              </Container>
            </SimpleBar>
            {/* <div className="sidebar-background"></div> */}
          </React.Fragment>
      </div>
      <div className="vertical-overlay"></div>
    </React.Fragment>
  );
};

export default Sidebar;
