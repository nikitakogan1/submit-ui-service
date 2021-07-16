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
function App (){
  const [showNavBar,setShowNavBar] = useState(false)
  const history = useHistory()
  // const addCourseOnSubmit = (event) => {
  //   event.preventDefault(event);
  //   console.log(event.target.name.value);
  //   console.log(event.target.year.value);
  //   console.log(event.target.number.value);
  //   var body = {year:parseInt(event.target.year.value), number:parseInt(event.target.number.value), name:event.target.name.value}
  //   console.log( JSON.stringify(body))
  //   fetch('http://localhost:3000/api/courses/', {method:'POST', 
  //    body: JSON.stringify(body), headers: {'Authorization': 'Basic ' + btoa('admin:admin')}})
  //    .then((response) => response.json())
  //    .then (data => {
  //      console.log(data);
  //    });
     
  // };
  return (
    <React.Fragment>
    <div className="App">
    <BrowserRouter>
    {showNavBar && <NavBar history={history}></NavBar>}
      <Switch>
        <Route exact path="/">
          <Login setNavBar={setShowNavBar} history={history}/>
        </Route>
        <AdminPrivateRoute path="/courses" component={Courses} navbar={setShowNavBar} history={history}></AdminPrivateRoute>
        <UserPrivateRoute path="/users/:id" component={User} navbar={setShowNavBar} history={history}></UserPrivateRoute>
        <AdminPrivateRoute path="/users/" component={UsersList} navbar={setShowNavBar} history={history}></AdminPrivateRoute>
      </Switch>
      </BrowserRouter>
  </div>
    </React.Fragment>

  );
}

const AdminAuthFunc = () => {
  var cookie = getCookie("submit-server-cookie")
  var stateCookie = getCookie("submit-last-server-state")
  if (cookie === undefined || stateCookie === undefined) {
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
