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
    constructor(props) {
      super(props);
      this.state = 
        {user_name:"",first_name:"",last_name:"", email:"", roles:{"elements":{}},courses_as_student:{"elements":{}},courses_as_staff:{"elements":{}}};
    this.componentDidMount=this.componentDidMount.bind(this);
    }
    
     updateDetails = (event) => {
        event.preventDefault(event);
        var body = {"user_name":event.target.user_name.value,"last_name":event.target.last_name.value, "email": event.target.email.value, "first_name":event.target.first_name.value,"password":event.target.password.value,
        "roles":this.state.roles,"courses_as_student":this.state.courses_as_student,"courses_as_staff":this.state.courses_as_staff}
        console.log( JSON.stringify(body))
        fetch('http://localhost:3000/api/users/' + event.target.user_name.value , {method:'PUT', 
         body: JSON.stringify(body), headers: {'Authorization': 'Basic ' + btoa('username:password')}})
         .then((response) => response.json())
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


<ListGroup variant="flush">
  <ListGroup.Item>UserName: {this.state.user_name}</ListGroup.Item>
  <ListGroup.Item>First Name: {this.state.first_name}</ListGroup.Item>
  <ListGroup.Item>Last Name: {this.state.last_name}</ListGroup.Item>
  <ListGroup.Item>Email: {this.state.email}</ListGroup.Item>
  <ListGroup.Item>Role: {this.parseResp(JSON.stringify(this.state.roles.elements))}</ListGroup.Item>
  <ListGroup.Item>Courses as student: {this.parseResp(JSON.stringify(this.state.courses_as_student.elements))}</ListGroup.Item>
  <ListGroup.Item>Courses as staff: {this.parseResp(JSON.stringify(this.state.courses_as_staff.elements))}</ListGroup.Item>
  <UserModal onSubmit={this.updateDetails} user={this.state}></UserModal>
</ListGroup>

        )
    }
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

