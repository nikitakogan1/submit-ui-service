import React from "react";
import { Component } from "react";
import { withRouter } from "react-router-dom";
import { Table } from 'semantic-ui-react';
import "./Courses.css"

class Courses extends Component {
    constructor(props) {
      super(props);
      this.state = {elements: [
        {year:null,number:null,name:null,my_position:null}
      ]
    };
    this.stateFromLogin = []
    this.username = ""
    this.userCoursesAsStudent = []
    this.userCoursesAsStuff= []
    this.componentDidMount=this.componentDidMount.bind(this);
    }
    
    getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    }


    getPositionForCourses(){

    }
    
    setCookie(name,value,days) {
      var expires = "";
      if (days) {
          var date = new Date();
          date.setTime(date.getTime() + (days*24*60*60*1000));
          expires = "; expires=" + date.toUTCString();
      }
      document.cookie = name + "=" + (value || "")  + expires + "; path=/";
  }

    componentDidMount() {
      if (this.props.location.state) {
        this.stateFromLogin = JSON.parse(this.props.location.state);
      } else {
        this.stateFromLogin = JSON.parse(this.getCookie("last-submit-server-state"))
      }
      this.username = this.stateFromLogin.username
      console.log("recieved the state",this.stateFromLogin.roles);
      this.stateFromLogin.roles.forEach((role) => {
        if (role === "admin" || role === "secretary") {
          // show all courses in the system  + buttons to add and delete
        } else if (role === "student"){
          //show only the students courses
          this.userCoursesAsStudent = this.stateFromLogin.staff_courses;
          this.userCoursesAsStuff = this.stateFromLogin.student_courses;
        }
      })


      fetch('http://localhost:3000/api/courses/', {method:'GET', 
      headers: {'Authorization': 'Basic ' + btoa('username:password')}})
      .then((response) => {
        return response.json()
      })
      .then (data => {
        this.setState(data);
      });
      this.setCookie("submit_last_visited_path", window.location.pathname, 0.0034)
    }

    render(){
      return (
        <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Number</Table.HeaderCell>
            <Table.HeaderCell>Year</Table.HeaderCell>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>My position</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
  
        <Table.Body>
          {this.state.elements.map(course => {
            return (
              <Table.Row key={course.number}>
                <Table.Cell>{course.number}</Table.Cell>
                <Table.Cell>
                  {course.year}
                </Table.Cell>
                <Table.Cell>
                  {course.name}
                </Table.Cell>
                <Table.Cell>
                  {course.my_position}
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
      
      );
      }
  
   }
  export default withRouter(Courses);


  //TODO: 

// 1. Add the student/stuff section in the table.
// 2. create course detail components.
//
