import React from "react";
import { Redirect,BrowserRouter, Route, Switch } from 'react-router-dom';
import Login from "./Login/login";
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import Courses from "./Courses/Courses"
import Cookies from "universal-cookie"
import { useHistory } from "react-router-dom";
import User from "./User/User";

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
        {/* <PrivateRoute path="/courses" component={Courses}></PrivateRoute> */}
        <PrivateRoute path="/users/:id" component={User}></PrivateRoute>
      </Switch>
      </BrowserRouter>
  </div>
  );
}


const cookies = new Cookies();
const authFunc = () => {
    var auth_cookie = getCookie("submit-server-cookie")
    var state_cookie = getCookie("last-submit-server-state")
    if (auth_cookie === null || auth_cookie !== "" || state_cookie === null || state_cookie !== "") {
      cookies.set('submit_last_visited_path', window.location.pathname, { path: '/' });
      return false
    }
    return true
  }
  
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

const PrivateRoute = ({ component: Component, ...rest }) => {

  const isLoggedIn = authFunc()
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
