import React from "react";
import { Component } from "react";
import { withRouter } from "react-router-dom";
import { Table } from 'semantic-ui-react';
//import "./Users.css"

class User extends Component {
    userURL = ""
    username = ""
    constructor(props) {
      super(props);
      this.state = 
        {username:"",first_name:"",last_name:"", email:"", roles:{"elements":{"std_user":{}}},"courses_as_student":{"elements":{}},"courses_as_staff":{"elements":{}}};
    this.componentDidMount=this.componentDidMount.bind(this);
    }
    
    getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    }

    componentDidMount() {
        var state_cookie = this.getCookie("last-submit-server-state");
        this.username = state_cookie.username;
        console.log(this.username);
        fetch("http://localhost:3000/api/users/" + this.username, {method:'GET', 
        headers: {'Authorization': 'Basic ' + btoa('username:password')}})
        .then((response) => {
            return response.json()
        })
        .then (data => {
            this.setState(data);
            console.log(this.state);
        });
    }

    render() {
        return (
            <div>Hello</div>
        )
    }
    //   if (this.props.location.state) {
    //     this.stateFromLogin = JSON.parse(this.props.location.state);
    //   } else {
    //     this.stateFromLogin = JSON.parse(this.getCookie("last-submit-server-state"))
    //   }
    //   this.username = this.stateFromLogin.username
    //   console.log("recieved the state",this.stateFromLogin.roles);
    //   this.stateFromLogin.roles.forEach((role) => {
    //     if (role === "admin" || role === "secretary") {
    //       // show all courses in the system  + buttons to add and delete
    //     } else if (role === "student"){
    //       //show only the students courses
    //       this.userCoursesAsStudent = this.stateFromLogin.staff_courses;
    //       this.userCoursesAsStaff = this.stateFromLogin.student_courses;
    //     }
    //   })

}

  export default withRouter(User);


  //TODO: 

// 1. Add the student/stuff section in the table.
// 2. create course detail components.
//
