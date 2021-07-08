import React from "react";
import { Component } from "react";
import { withRouter,Route, Redirect } from "react-router-dom";
import "./User.css"
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";
import Col from "react-bootstrap/Col"

import Form from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"
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
        var body = {"user_name":this.state.user_name,"last_name":event.target.last_name.value, "email": event.target.email.value, "first_name":event.target.first_name.value,"password":this.state.password,
        "roles":this.state.roles,"courses_as_student":this.state.courses_as_student,"courses_as_staff":this.state.courses_as_staff}
        console.log( JSON.stringify(body))
         fetch('http://localhost:3000/api/users/' + this.userNameFromReq , {method:'PUT', 
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
        this.userURL = "http://localhost:3000/api/users/" + this.userNameFromReq
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
        console.log("the state before sending is", this.state.courses_as_student)
        return (
<Form onSubmit={this.updateDetails}>
  <Form.Row>
    <Form.Group as={Col} controlId="formGridUserName">
      <Form.Label>User name:</Form.Label>
      <Form.Control type="user name" placeholder="Enter username" disabled value={this.state.user_name} />
    </Form.Group>
  </Form.Row>

  <Form.Group controlId="first_name">
    <Form.Label>First name: </Form.Label>
    <Form.Control defaultValue={this.state.first_name} />
  </Form.Group>

  <Form.Group controlId="last_name">
    <Form.Label>Last name: </Form.Label>
    <Form.Control defaultValue={this.state.last_name} />
  </Form.Group>

  <Form.Row>
    <Form.Group controlId="email">
      <Form.Label>Email: </Form.Label>
      <Form.Control defaultValue={this.state.email} />
    </Form.Group>

    <Form.Group controlId="roles">
      <Form.Label>Roles: </Form.Label>
      <Form.Control disabled value={this.parseResp(JSON.stringify(this.state.roles.elements)) } />
    </Form.Group>

  </Form.Row>

  <Button variant="primary" type="submit">
    Submit
  </Button>
  {this.state.alertSuccess && <AlertSuccess></AlertSuccess>}
        {this.state.alertFailure && <AlertFailed></AlertFailed>}
</Form>

)}
}


const UserCourses = (props) => {
  console.log(JSON.stringify(props))
  return (
      <div class="list-group">
        My courses
        {/* {props.courses_as_student.map(course => {
            return (
              <button type="button" class="list-group-item list-group-item-action"> {course.key}</button>
            );
          })} */}
  </div>
  )
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

