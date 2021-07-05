import React from "react";
import { Redirect,BrowserRouter, Route, Switch } from 'react-router-dom';
import Login from "./Login/login";
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import Courses from "./Courses/Courses"
import { useHistory } from "react-router-dom";
import User from "./Users/User";

function App (){
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
    <div className="App">
    <BrowserRouter>
      <Switch>
        <Route exact path="/">
          <Login history={history}/>
        </Route>
        <CoursesPrivateRoute path="/courses" component={Courses}></CoursesPrivateRoute>
        <UserPrivateRoute path="/users/:id" component={User} history={history}></UserPrivateRoute>

      </Switch>
      </BrowserRouter>
  </div>
  );
}

const userAuthFunc = () => {
  var cookie = getCookie("submit-server-cookie")
  var stateCookie = getCookie("last-submit-server-state")
  if (cookie === undefined || stateCookie === undefined) {
    setCookie('submit_last_visited_path', window.location.pathname, 0.0034);
   return false
  }
  return true
}


const coursesAuthFunc = () => {
    var cookie = getCookie("submit-server-cookie")
    var stateCookie = getCookie("last-submit-server-state")
    console.log(cookie)
    console.log(stateCookie)
    if (cookie === undefined || stateCookie === undefined) {
     setCookie('submit_last_visited_path', window.location.pathname, 0.0034);
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

const CoursesPrivateRoute = ({ component: Component, ...rest }) => {

  // Add your own authentication on the below line.
  const isLoggedIn = coursesAuthFunc()
  console.log(isLoggedIn)
  return (
    <Route
      {...rest}
      render={props =>
        isLoggedIn ? (
          <Component {...props} />
        ) : (
          <Redirect to={{ pathname: '/' }} />
        )
      }
    />
  )
}

const UserPrivateRoute = ({ component: Component, ...rest }) => {

  // Add your own authentication on the below line.
  const isLoggedIn = userAuthFunc()
  console.log(isLoggedIn)
  return (
    <Route
      {...rest}
      render={props =>
        isLoggedIn ? (
          <Component {...props} />
        ) : (
          <Redirect to={{ pathname: '/' }} />
        )
      }
    />
  )
}

export default App;
