import React,{useState} from "react";
import {BrowserRouter, Route, Switch, withRouter, Redirect} from 'react-router-dom';
import Login from "./Login/login";
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import Courses from "./Courses/Courses"
import Course from "./Courses/Course"
import { useHistory } from "react-router-dom";
import User from "./Users/User";
import NavBar from "./Navbar/Navbar"
import UsersList from "./UsersList/UsersList"
import AgentList from "./Agents/Agents"
import "./App.css"
import {isLoggedIn, getLoggedInUserName, SessionRoute} from  "./Utils/session"
import AssignmentsList from "./Assignments/AssignmentList"
import Assignment from "./Assignments/Assignment"
import AssignmentDefList from "./AssignmentDef/AssignmentDefs"
import Messages from "./Messages/Messages"
import Files from "./Files/Files"
import TestsList from "./Tests/TestsList"
import Test from "./Tests/Test"
import TasksList from "./Tasks/Tasks"
import Task from "./Tasks/Task"
import Welcome from "./Welcome/Welcome"
import AssignmentDef from "./AssignmentDef/AssignmentDef";
import Appeal from "./Appeals/Appeal";
import Agent from "./Agents/Agent";
import AppealList from "./Appeals/AppealsList";

function App (){
  const [showNavBar,setShowNavBar] = useState(false)
  const history = useHistory()
  const loggedInUserName = getLoggedInUserName()

  const SomethingWentWrongPage = ({ component: Component, ...rest }) => {
    setShowNavBar(true);
    return (
      <Route
        {...rest}
        render={props =>
          isLoggedIn() ? (
            <div id="wrapper">
            <div id="info">
                <h3>Something went wrong... please try again!</h3>
            </div>
        </div >
          ) : (
            <Redirect to={{ pathname: '/' }} />
          )
        }
      />
    )
  }
  
  const Page403 = ({ component: Component, ...rest }) => {
    setShowNavBar(true);
    return (
      <Route
        {...rest}
        render={props =>
          isLoggedIn() ? (
            <div id="wrapper">
            <div id="info">
                <h3>You are not authorized to see this page</h3>
            </div>
        </div >
          ) : (
            <Redirect to={{ pathname: '/' }} />
          )
        }
      />
    )
  }
  
  const PageNotFound = ({ component: Component, ...rest }) => {
    setShowNavBar(true);
    return (
      <Route
        {...rest}
        render={props =>
          isLoggedIn() ? (
            <div id="wrapper">
            <div id="info">
                <h3>This page could not be found</h3>
            </div>
        </div >
          ) : (
            <Redirect to={{ pathname: '/' }} />
          )
        }
      />
    )
  }

  return (
    <React.Fragment >
    <div className="App">
    <BrowserRouter>
    {showNavBar && <NavBar history={history}></NavBar>}
    {isLoggedIn() && <div id="session-div">
      <h7 id="HelloUser">Hello  {loggedInUserName}</h7>
      <br></br>
    </div>}
    <br></br>
      <Switch>
        <Route exact path="/">
          <Login navbar={setShowNavBar} history={history}/>
        </Route>
        <SessionRoute path="/appeals/:id" component={Appeal} navbar={setShowNavBar} history={history}></SessionRoute>
        <SessionRoute path="/appeals/" component={AppealList} navbar={setShowNavBar} history={history}></SessionRoute>
        <SessionRoute path="/welcome" component={Welcome} navbar={setShowNavBar} history={history}></SessionRoute>
        <SessionRoute path="/courses/:id" component={Course} navbar={setShowNavBar} history={history}></SessionRoute>
        <SessionRoute path="/courses" component={Courses} navbar={setShowNavBar} history={history}></SessionRoute>
        <SessionRoute path="/assignment_instances/:id" component={Assignment} navbar={setShowNavBar} history={history}></SessionRoute>
        <SessionRoute path="/users/:id" component={User} navbar={setShowNavBar} history={history}></SessionRoute>
        <SessionRoute path="/assignment_instances" component={AssignmentsList} navbar={setShowNavBar} history={history}></SessionRoute>
        <SessionRoute path="/assignment_definitions/:id" component={AssignmentDef} navbar={setShowNavBar} history={history}></SessionRoute>
        <SessionRoute path="/assignment_definitions" component={AssignmentDefList} navbar={setShowNavBar} history={history}></SessionRoute>
        <SessionRoute path="/users/" component={UsersList} navbar={setShowNavBar} history={history}></SessionRoute>
        <SessionRoute path="/agents/:id" component={Agent} navbar={setShowNavBar} history={history}></SessionRoute>
        <SessionRoute path="/agents/" component={AgentList} navbar={setShowNavBar} history={history}></SessionRoute>
        <SessionRoute path="/tests/:id" component={Test} navbar={setShowNavBar} history={history}></SessionRoute>
        <SessionRoute path="/tasks/:id" component={Task} navbar={setShowNavBar} history={history}></SessionRoute>
        <SessionRoute path="/tests/" component={TestsList} navbar={setShowNavBar} history={history}></SessionRoute>
        <SessionRoute path="/tasks/" component={TasksList} navbar={setShowNavBar} history={history}></SessionRoute>
        <SessionRoute path="/messages/" component={Messages} navbar={setShowNavBar} history={history}></SessionRoute>
        <SessionRoute path="/files/:path" component={Files} navbar={setShowNavBar} history={history}></SessionRoute>
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
