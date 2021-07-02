import React from "react";
import { Component } from "react";
import { withRouter } from "react-router-dom";
import { Table } from 'semantic-ui-react';

class Courses extends Component {
    constructor(props) {
      super(props);
      this.state = {elements: [
        {year:null,number:null,name:null}
      ]
    };
    this.userRoles = []
    this.componentDidMount=this.componentDidMount.bind(this);

    }
    
    componentDidMount() {
      this.userRoles = JSON.parse(this.props.location.state)
      console.log("recieved the props",this.userRoles.roles)
      this.userRoles.roles.forEach((role) => {
        if (role === "admin") {
          // show all courses in the system  + buttons to add and delete
        } else if (role === "student"){
          //show only the students courses
        } else if (role === "secretary"){
          // show all the courses + buttons to add and delete
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
                  {}
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