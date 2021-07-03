import React from "react";
import { Component } from "react";
import { withRouter } from "react-router-dom";
import { LabelDetailProps, Table } from 'semantic-ui-react';
//import "./Users.css"
class User extends Component {
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

    componentDidMount() {
        this.userNameFromReq = this.props.match.params.id
        var state_cookie = this.getCookie("last-submit-server-state");
        console.log("the state cookie is" ,state_cookie)
        this.username = JSON.parse(state_cookie).user_name;
        console.log("the username is", this.username);
        fetch("http://localhost:3000/api/users/" + this.username, {method:'GET', 
        headers: {'Authorization': 'Basic ' + btoa('username:password')}})
        .then((response) => {
            return response.json()
        })
        .then (data => {
            this.setState(data);
            console.log("final state is",this.state);
        });
    }

    render() {
        return (
            <Table>
            <Table.Body>
                    <Table.Row key={this.state.user_name}></Table.Row>
                    <Table.Cell>User name: {this.state.user_name}</Table.Cell>
                    <Table.Row>First Name: {this.state.first_name}</Table.Row>
                    <Table.Row>Last Name: {this.state.last_name}</Table.Row>
                    <Table.Row>Email: {this.state.email}</Table.Row>
                    <Table.Row>Roles: {(JSON.stringify(this.state.roles.elements))}</Table.Row>
                    <Table.Row>Courses as student: {(JSON.stringify(this.state.courses_as_student.elements))}</Table.Row>
                    <Table.Row>Courses as staff: {(JSON.stringify(this.state.courses_as_staff.elements))}</Table.Row>
            </Table.Body>
          </Table>
        )
    }
}

  export default withRouter(User);


  //TODO: 

// 1. Add the student/stuff section in the table.
// 2. create course detail components.
//
