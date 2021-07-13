import React, { useEffect } from "react";
import { Component } from "react";
import { withRouter,Route, Redirect } from "react-router-dom";
import "./User.css"
import Col from "react-bootstrap/Col"
import Multiselect from 'react-bootstrap-multiselect'
import Form from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"
import  { useState } from 'react';
import Modal from "react-bootstrap/Modal"
import FormGroup from "react-bootstrap/FormGroup"
import MyForm, { TriggerButton } from "./UserModal"
import { render } from "@testing-library/react";
class User extends Component {
    userURL = ""
    userNameFromReq = ""
    username = ""
    constructor(props) {
      super(props);
      this.state = 
        {alertFailure:false, alertSuccess: false,user_name:"",first_name:"",last_name:"", email:"", roles:{"elements":{}},courses_as_student:{"elements":{}},courses_as_staff:{"elements":{}}};
    this.componentDidMount=this.componentDidMount.bind(this);
    this.checkAdmin=this.checkAdmin.bind(this);
    }
    
      updateDetails = (event) => {
        event.preventDefault(event);
        console.log(event.target.Admin.checked)
        console.log(event.target.Secretary.checked)
        console.log(event.target.standartUser.checked)
        var roles = this.state.roles;
        if (event.target.standartUser.checked){
          roles = {"elements":{"std_user":{}}}
        }
        if (event.target.Secretary.checked){
          roles = {"elements":{"secretary":{}}}
        }
        if (event.target.Admin.checked){
          roles = {"elements":{"admin":{}}}
        }
        var body = {"user_name":this.state.user_name,"last_name":event.target.last_name.value, "email": event.target.email.value, "first_name":event.target.first_name.value,"password":this.state.password,
        "roles":roles,"courses_as_student":this.state.courses_as_student,"courses_as_staff":this.state.courses_as_staff}
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
        this.checkAdmin()
    }

    parseResp(str){ 
      console.log("parse resp",str)
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

    checkAdmin() {
      if (this.parseResp(JSON.stringify(this.state.roles.elements)) === "Admin") {
        return true
      }
      return false
    }

    checkAdminCookie(){
      var state_cookie = getCookie("submit-last-server-state");
      var roles = JSON.parse(state_cookie).roles;
      if (this.parseResp(JSON.stringify(roles)) === "Admin")
      {
        return true
      } else {
        return false
      }      
    }

    courseOnClick = (course) => {
      console.log(course)
      this.props.history.push("/courses/" + course.replaceAll(":","/"))
    }

    render() {
      var role = this.parseResp(JSON.stringify(this.state.roles.elements))
        console.log("the state before sending is", this.parseResp(JSON.stringify(this.state.roles.elements)))
        return (
          <React.Fragment>
<Form onSubmit={this.updateDetails}>
  <Form.Row>
    <Form.Group as={Col} controlId="user_name">
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

Roles:
{this.checkAdminCookie() ? (this.parseResp(JSON.stringify(this.state.roles.elements)) !== "None" && <AdminUserRoles role={role}></AdminUserRoles>) : <UserRoles></UserRoles>}
 {/* {this.checkAdminCookie() ? <AdminUserRoles role={role}></AdminUserRoles>
 : <UserRoles></UserRoles>} */}
  </Form.Row>
  <Button variant="primary" type="submit">
    Submit
  </Button>
  {this.state.alertSuccess && <AlertSuccess></AlertSuccess>}
  {this.state.alertFailure && <AlertFailed></AlertFailed>}
</Form>
<UserCourses courseOnClick={this.courseOnClick} studentCourses={this.state.courses_as_student.elements} staffCourses={this.state.courses_as_staff.elements}></UserCourses>
{this.checkAdminCookie() && <AddUserModal></AddUserModal>}
</React.Fragment>

)}
}
 


class AdminUserRoles extends Component {
  constructor(props){
    super(props)
    this.state = {
      isAdmin: false, isSec: false, isStdUsr: false, isAgent: false
    }
    this.componentDidMount = this.componentDidMount.bind(this)
  }


  componentDidMount() {
    var role = this.props.role
    console.log("the role is",role)
    if (role === "Admin"){
      this.setState({isAdmin : true})
    }
    if (role === "Secretary"){
      this.setState({isSec : true})
    }
    if (role === "User"){
      this.setState({isStdUsr : true})
    }
    if (role === "Agent"){
      this.setState({isAgent : true})
    }
  }
  render () {
    return <div className="RolesRadio">
      <fieldset>
      <FormGroup>
      <Form.Check
      type="radio"
      label={`Admin`}
      id={`Admin`}
      onChange={e => {
        this.setState({isAdmin : e.currentTarget.checked})
        this.setState({isSec : !e.currentTarget.checked})
        this.setState({isAgent : !e.currentTarget.checked})
        this.setState({isStdUsr : !e.currentTarget.checked})

      }
      }
      checked={this.state.isAdmin === true}
      />
      <Form.Check
      type="radio"
      label={`Agent`}
      id={`Agent`}
      checked={this.state.isAgent === true}
      onChange={e =>{
        this.setState({isAdmin : !e.currentTarget.checked})
        this.setState({isSec : !e.currentTarget.checked})
        this.setState({isAgent : e.currentTarget.checked})
        this.setState({isStdUsr : !e.currentTarget.checked})
      }
      }
      />
      <Form.Check
      onChange={e => {
        this.setState({isAdmin : !e.currentTarget.checked})
        this.setState({isSec : e.currentTarget.checked})
        this.setState({isAgent : !e.currentTarget.checked})
        this.setState({isStdUsr : !e.currentTarget.checked})
      }}
      type="radio"
      label={`Secretary`}
      id={`Secretary`}
      checked={this.state.isSec === true}

      />
      <Form.Check
      onChange={e => {
        this.setState({isAdmin : !e.currentTarget.checked})
        this.setState({isSec : !e.currentTarget.checked})
        this.setState({isAgent : !e.currentTarget.checked})
        this.setState({isStdUsr : e.currentTarget.checked})
      }}
      type="radio"
      label={`Standart user`}
      id={`standartUser`}
      checked={this.state.isStdUsr === true}
      />
      </FormGroup>
  </fieldset>      
  </div>
  }
  
}


const UserRoles = () => {
return (
  <div key={`Admin`} className="mb-3">
  <Form.Check
    disabled
    type="radio"
    label={`radio`}
    id={`Admin`}
  />
  <Form.Check
    disabled
    type="radio"
    label={`Agent`}
    id={`Agent`}
  />
  <Form.Check
    disabled
    type="radio"
    label={`Secretary`}
    id={`Secretary`}
  />
  <Form.Check
    disabled
    type="radio"
    label={`Standart user`}
    id={`standartUser`}
    defaultChecked
  />
</div>
)
}


const UserCourses = (props) => {
  
  var studentCoursesList = Object.keys(props.studentCourses)
  var staffCoursesList = Object.keys(props.staffCourses)
  var index = 0
  return (
    <React.Fragment>
        <div class="list-group">
          Courses list:
    {studentCoursesList.map(course => {
            index++
            return (
              index < 6 && <button type="button" onClick={() => props.courseOnClick(course)} class="list-group-item list-group-item-primary">
              {course.replaceAll(":", "/")} - Student
            </button>
            );
    })}
        </div>
        <div class="list-group">
    {staffCoursesList.map(course => {
            index++
            return (
              index < 6 && <button  type="button"  onClick={() => props.courseOnClick(course)} class="list-group-item list-group-item-primary">  
              {course.replaceAll(":", "/")} - Staff
            </button>
            );
    })}
    Click on the "My courses" tab in the navigation bar to see all the courses.
  </div>
    </React.Fragment>

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


 const MultiSelect = (props) => {
  const data = [{ value:'One', selected:true }, { value: 'Two' }, { value:'Three' }]
  return ( 
    <Multiselect onChange={props.handleChange} data={data} multiple />
  )

}

function AddUserModal() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);


  return (
    <>
      <Button id="addUser" variant="primary" onClick={handleShow}>
        Add user to course
      </Button>

      <Modal show={show} onHide={handleClose} animation={false}>
        <Modal.Header closeButton>
          <Modal.Title>Choose course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          
          
          
          
        {/* <MyForm></MyForm> */}





        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

  export default withRouter(User);

