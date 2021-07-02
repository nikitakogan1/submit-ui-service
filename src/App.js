import React from "react";
import Container from "./Container";
import { Redirect,BrowserRouter, Route, Switch } from 'react-router-dom';
import Login from "./Login/login";
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import Courses from "./Courses/Courses"
import Cookies from "universal-cookie"

function App (){
  const addCourseOnSubmit = (event) => {
    event.preventDefault(event);
    console.log(event.target.name.value);
    console.log(event.target.year.value);
    console.log(event.target.number.value);
    var body = {year:parseInt(event.target.year.value), number:parseInt(event.target.number.value), name:event.target.name.value}
    console.log( JSON.stringify(body))
    fetch('http://localhost:3000/api/courses/', {method:'POST', 
     body: JSON.stringify(body), headers: {'Authorization': 'Basic ' + btoa('admin:admin')}})
     .then((response) => response.json())
     .then (data => {
       console.log(data);
     });
     
  };
  return (
    <div className="App">
    <BrowserRouter>
      <Switch>
        <Route path="/login">
          <Login />
        </Route>
        <PrivateRoute path="/courses" component={Courses}></PrivateRoute>
      </Switch>
        <PrivateRoute exact path="/">
          Welcome page
        </PrivateRoute>
      </BrowserRouter>
  </div>
  );
}


const cookies = new Cookies();
const authFunc = () => {
    var cookie = getCookie("submit-server-cookie")
    if (cookie == null) {
     cookies.set('submit_last_visited_path', '/courses', { path: '/' });
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

  // Add your own authentication on the below line.
  const isLoggedIn = authFunc()
  console.log(isLoggedIn)
  return (
    <Route
      {...rest}
      render={props =>
        isLoggedIn ? (
          <Component {...props} />
        ) : (
          <Redirect to={{ pathname: '/login' }} />
        )
      }
    />
  )
}

export default App;
