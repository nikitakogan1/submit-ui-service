import React from "react";
import { Component } from "react";
import { withRouter } from "react-router-dom";
import { Table } from 'semantic-ui-react';

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
    
    componentDidMount() {
      this.stateFromLogin = JSON.parse(this.props.location.state);
      this.username = this.stateFromLogin.username
      console.log("recieved the props",this.stateFromLogin.roles);
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
        console.log(data);
        this.setState(data);
      });
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
                  {course.position}
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
