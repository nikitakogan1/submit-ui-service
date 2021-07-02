import React from "react";
import { Component } from "react";
import { Table } from 'semantic-ui-react';

class Courses extends Component {

    constructor(props) {
      super(props);
      this.state = {elements: [
        {year:null,number:null,name:null}
      ]
    };
    }
  
    componentDidMount() {
      fetch('http://localhost:3000/api/courses/', {method:'GET', 
      headers: {'Authorization': 'Basic ' + btoa('username:password')}})
      .then((response) => {
        console.log(document.cookie)
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
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
      );
      }
  
   }
  export default Courses;