import React,{useState} from "react";
import {BrowserRouter, Route, Switch, withRouter} from 'react-router-dom';
import Login from "./Login/login";
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import Courses from "./Courses/Courses"
import { useHistory } from "react-router-dom";
import User from "./Users/User";
import NavBar from "./Navbar/Navbar"
import UsersList from "./UsersList/UsersList"
import AgentList from "./Agents/Agents"
import Button from "react-bootstrap/Button"
import "./App.css"
import {getCookie, setCookie, eraseCookie, SessionRoute} from  "./Utils/session"
function App (){
  const [showNavBar,setShowNavBar] = useState(false)
  const history = useHistory()
 
  // remove cookies in order to log out.
  const LogOutBut = () => {
    setShowNavBar(false);
    eraseCookie("submit-server-cookie");
    eraseCookie("submit-last-server-state");
    //eraseCookie("submit-last-visited-path");
    history.push("/");
    history.go(0);
  }

  const SomethingWentWrongPage = () => {
    setShowNavBar(true);
    return (
        <div id="wrapper">
            {/* <img src="https://i.imgur.com/qIufhof.png" /> */}
            <div id="info">
                <h3>Something went wrong.. please try again!</h3>
            </div>
        </div >
    )
  }
  
  const Page403 = () => {
    setShowNavBar(true);
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
    setShowNavBar(true);
    return (
        <div id="wrapper">
            {/* <img src="https://i.imgur.com/qIufhof.png" /> */}
            <div id="info">
                <h3>This page could not be found</h3>
            </div>
        </div >
    )
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
        <SessionRoute path="/courses" component={Courses} navbar={setShowNavBar} history={history}></SessionRoute>
        <SessionRoute path="/users/:id" component={User} navbar={setShowNavBar} history={history}></SessionRoute>
        <SessionRoute path="/users/" component={UsersList} navbar={setShowNavBar} history={history}></SessionRoute>
        <SessionRoute path="/agents/" component={AgentList} navbar={setShowNavBar} history={history}></SessionRoute>
        <Route component={Page403} path={"/unauthorized"}/>
        <Route component={SomethingWentWrongPage} path={"/internal-error"}/>
        <Route component={PageNotFound} path={"/"}/>
      </Switch>
      </BrowserRouter>
  </div>
    </React.Fragment>

  );
}

export default withRouter(App);
