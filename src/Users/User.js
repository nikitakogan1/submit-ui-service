import React from "react";
import { Component } from "react";
import { withRouter,Route, Redirect } from "react-router-dom";
import { Table } from 'semantic-ui-react';
import UserModal from "./UserModal";
import "./User.css"
import ListGroup from "react-bootstrap/ListGroup";


class User extends Component {
    userURL = ""
    userNameFromReq = ""
    username = ""
    alert = false
    constructor(props) {
      super(props);
      this.state = 
        {alertFailure:false, alertSuccess: false,user_name:"",first_name:"",last_name:"", email:"", roles:{"elements":{}},courses_as_student:{"elements":{}},courses_as_staff:{"elements":{}}};
    this.componentDidMount=this.componentDidMount.bind(this);
    }
    
      updateDetails = (event) => {
        event.preventDefault(event);
        var body = {"user_name":this.state.user_name,"last_name":event.target.last_name.value, "email": event.target.email.value, "first_name":event.target.first_name.value,"password":event.target.password.value,
        "roles":this.state.roles,"courses_as_student":this.state.courses_as_student,"courses_as_staff":this.state.courses_as_staff}
        console.log( JSON.stringify(body))
         fetch('http://localhost:3000/api/users/' + this.state.user_name , {method:'PUT', 
         body: JSON.stringify(body), headers: {'Authorization': 'Basic ' + btoa('username:password')}})
         .then((response) => {
          if (response.ok) {
            this.setState({alertSuccess: true})
          } else {
            this.setState({alertFailure: true})
          }
          return response.json()
         })
         .then (data => {
           console.log(data);
         });
    }


    componentDidMount() {
        this.userNameFromReq = this.props.match.params.id
        var state_cookie = getCookie("submit-last-server-state");
        console.log("the state cookie is" ,state_cookie)
        this.username = JSON.parse(state_cookie).user_name;
        console.log("the username is", this.username);
        this.userURL = "http://localhost:3000/api/users/" + this.username
        fetch(this.userURL, {method:'GET', 
        headers: {'Authorization': 'Basic ' + btoa('username:password')}})
        .then((response) => {
            return response.json()
        })
        .then (data => {
            this.setState(data);
            console.log("final state is",this.state);
        });
    }

    parseResp(str){ 
      console.log(str)
      if (str.includes("admin")){
        return "Admin"
      } else if (str.includes("secretary")) {
        return "Secretary"
      } else if (str.includes("std_user")){
        return "User"
      }
      var toRet = str.replaceAll("{","").replaceAll("}","").replaceAll(",", " ").replaceAll(":"," ").replaceAll("\"","")
      if (toRet === ""){
        return "None"
      }
    }

    render() {
        console.log("the state before sending is", this.state)
        return (


<form onSubmit={this.updateDetails}>
      <div className="garage-title">
        <label htmlFor="user_name">User name:</label> 
        <text>
        {this.parseResp(JSON.stringify(this.state.user_name))}
        </text>
      </div>  
      <div className="garage-title">
        <label htmlFor="password"> Password: </label>
        <input className="garage-title" id="password" defaultValue=""/>
      </div>
      <div className="garage-title">
        <label htmlFor="first_name">First Name:</label>
        <input className="garage-title" id="first_name" defaultValue={this.state.first_name} />
      </div>
      <div className="garage-title">
        <label htmlFor="last_name">Last Number: </label>
        <input className="garage-title" id="last_name" defaultValue={this.state.last_name} />
      </div>
      <div className="garage-title">
        <label htmlFor="email">Email: </label>
        <input className="garage-title" id="email" defaultValue={this.state.email}/>
      </div>
      <div className="garage-title">
        <label htmlFor="roles">Roles: </label>
        <text>
        {this.parseResp(JSON.stringify(this.state.roles.elements))}
        </text>
      </div>
      <div className="garage-title">
        <label htmlFor="courses_as_student">Courses as student: </label>
        <text>
        {this.parseResp(JSON.stringify(this.state.courses_as_student.elements))}
        </text>
      </div>
      <div className="garage-title">
        <label htmlFor="courses_as_staff">Courses as staff: </label>
        <text>
        {this.parseResp(JSON.stringify(this.state.courses_as_staff.elements))}
        </text>
      </div>
      <div className="form-group">
        <button className="form-control btn btn-primary" type="submit">
          Save
        </button>
        {this.state.alertSuccess && <AlertSuccess></AlertSuccess>}
        {this.state.alertFailure && <AlertFailed></AlertFailed>}
      </div>
    </form>
        )
    }
}


const AlertSuccess = () => {
    return (
      <div class="alert alert-success" role="alert">
      User data updated successfully!
      </div>
    )
}

  const AlertFailed = () => {
    return (
     <div class="alert alert-danger" role="alert">
       Failed to update user data! try again!
     </div>
    )
}

export const UserPrivateRoute = ({ component: Component, ...rest }) => {

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

const userAuthFunc = () => {
  var cookie = getCookie("submit-server-cookie")
  var stateCookie = getCookie("submit-last-server-state")
  if (cookie === undefined || stateCookie === undefined) {
    setCookie('submit-last-visited-path', window.location.pathname, 0.0034);
   return false
  }
  return true
}

  export default withRouter(User);

