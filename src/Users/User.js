import React from "react";
import { Component } from "react";
import { withRouter } from "react-router-dom";
import { Table } from 'semantic-ui-react';
import UserContainer from "./UserModal";
//import "./Users.css"

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
    
    getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
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
        var state_cookie = this.getCookie("last-submit-server-state");
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
      return str.replaceAll("{","").replaceAll("}","").replaceAll(",", " ").replaceAll(":"," ").replaceAll("\"","")
    }

    render() {
        console.log("the state before sending is", this.state)
        return (
            <Table>
            <Table.Body>
                    <Table.Row key={this.state.user_name}></Table.Row>
                    <Table.Cell>User name: {this.state.user_name}</Table.Cell>
                    <Table.Row>First Name: {this.state.first_name}</Table.Row>
                    <Table.Row>Last Name: {this.state.last_name}</Table.Row>
                    <Table.Row>Email: {this.state.email}</Table.Row>
                    <Table.Row>Roles: {this.parseResp(JSON.stringify(this.state.roles.elements))}</Table.Row>
                    <Table.Row>Courses as student: {(this.parseResp(JSON.stringify(this.state.courses_as_student.elements)))}</Table.Row>
                    <Table.Row>Courses as staff: {(this.parseResp(JSON.stringify(this.state.courses_as_staff.elements)))}</Table.Row>
            </Table.Body>
           <UserContainer onSubmit={this.updateDetails} user={this.state}></UserContainer>
          </Table>
        )
    }
}

  export default withRouter(User);

