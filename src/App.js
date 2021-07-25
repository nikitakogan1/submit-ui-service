import React,{useState} from "react";
import { Redirect,BrowserRouter,Router, Route, Switch,withRouter } from 'react-router-dom';
import Login from "./Login/login";
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import Courses from "./Courses/Courses"
import { useHistory } from "react-router-dom";
import User from "./Users/User";
import {UserPrivateRoute} from "./Users/User"
import NavBar from "./Navbar/Navbar"
import UsersList from "./UsersList/UsersList"
import AgentList from "./Agents/Agents"
import Button from "react-bootstrap/Button"
import "./App.css"
function App (){
  const [showNavBar,setShowNavBar] = useState(false)
  const history = useHistory()
 
  // remove cookies in order to log out.
  const LogOutBut = () => {
    eraseCookie("submit-server-cookie")
    eraseCookie("submit-last-server-state")
    history.go(0)
    function eraseCookie(name) {   
      document.cookie = name+'=; Max-Age=-99999999;';  
  }
  }


  return (
    <React.Fragment>
    <div className="App">
    <BrowserRouter>
    {showNavBar && <NavBar history={history}></NavBar>}
    {getCookie("submit-server-cookie") !== undefined && getCookie("submit-last-server-state") !== undefined && <Button id="logoutBut" history={history} onClick={LogOutBut}>Log out</Button>}
      <Switch>
        <Route exact path="/">
          <Login setNavBar={setShowNavBar} history={history}/>
        </Route>
        <UserPrivateRoute path="/courses" component={Courses} navbar={setShowNavBar} history={history}></UserPrivateRoute>
        <UserPrivateRoute path="/users/:id" component={User} navbar={setShowNavBar} history={history}></UserPrivateRoute>
        <AdminPrivateRoute path="/users/" component={UsersList} navbar={setShowNavBar} history={history}></AdminPrivateRoute>
        <AdminPrivateRoute path="/agents/" component={AgentList} navbar={setShowNavBar} history={history}></AdminPrivateRoute>
        <Route component={PageNotFound} path={"/not-found"}/>
        {/* <Route component={Page401} path={"/unauthorized"}/>
        <Route component={Page401} path={"/unauthorized"}/>
        <Route component={Page401} path={"/error"}/> */}
      </Switch>
      </BrowserRouter>
  </div>
    </React.Fragment>

  );
}

const SomethingWentWrongPage = () => {
  return (
      <div id="wrapper">
          {/* <img src="https://i.imgur.com/qIufhof.png" /> */}
          <div id="info">
              <h3>Something went wrong.. please try again!</h3>
          </div>
      </div >
  )
}




const Page401 = () => {
  return (
      <div id="wrapper">
          {/* <img src="https://i.imgur.com/qIufhof.png" /> */}
          <div id="info">
              <h3>You are not authorized to see this page</h3>
          </div>
      </div >
  )
}



const PageNotFound = () => {
  return (
      <div id="wrapper">
          {/* <img src="https://i.imgur.com/qIufhof.png" /> */}
          <div id="info">
              <h3>This page could not be found</h3>
          </div>
      </div >
  )
}

const AdminAuthFunc = () => {
  var cookie = getCookie("submit-server-cookie")
  var stateCookie = getCookie("submit-last-server-state")
  if (cookie === undefined || stateCookie === undefined) {
    setCookie('submit-last-visited-path', window.location.pathname, 0.0034);
    return false
   }
   return true
}
  
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

function setCookie(name,value,days) {
  var expires = "";
  if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days*24*60*60*1000));
      expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

const AdminPrivateRoute = ({ component: Component, ...rest }) => {

  // Add your own authentication on the below line.
  const isLoggedIn = AdminAuthFunc()
  console.log(isLoggedIn)
  return (
    <Route
      {...rest}
      render={props =>
        isLoggedIn ? (
          <Component {...props} {...rest} />
        ) : (
          <Redirect to={{ pathname: '/' }} />
        )
      }
    />
  )
}



export default withRouter(App);
