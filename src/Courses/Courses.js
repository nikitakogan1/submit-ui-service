import React from "react";
import { Component } from "react";
import { withRouter } from "react-router-dom";
import "./Courses.css"
import BootstrapTable from 'react-bootstrap-table-next';
import Button from "react-bootstrap/Button"

function removeItemOnce(arr, value) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

class Courses extends Component {

  constructor(props) {
    super(props);
    this.state = {coursesSelectedToDelete: [], elements: [
      {year:null,number:null,name:null}
    ]
  };
  this.componentDidMount=this.componentDidMount.bind(this);
  this.deleteSelectedCourses=this.deleteSelectedCourses.bind(this);
  this.onSelect=this.onSelect.bind(this);

  }
  deleteSelectedCourses = () => {
    this.state.coursesSelectedToDelete.forEach( (course) => {
        course = JSON.parse(course)
        fetch('http://localhost:3000/api/courses/' + course.number + "/" + course.year, {method:'DELETE', 
        headers: {'Authorization': 'Basic ' + btoa('username:password')}})
        .then((response) => {
        if (!response.ok){
            alert("balagan")
        }
        return response.json()
        });
    })
    this.props.history.go(0)
}

  columns = [{
    dataField: 'name',
    text: 'Course name',
    // formatter: (cell, row) => <a href={cell.course.year + "/" + cell.course_number}> {cell} </a>,
  }, {
    dataField: 'year',
    text: 'Course year'
  }, {
    dataField: 'number',
    text: 'Course number'
  }];

  onSelect = (props) => {
    //console.log("Zzz",this.state)
    //console.log({"year": props.year, "number": props.number})
    var index = this.state.coursesSelectedToDelete.indexOf(JSON.stringify({year: props.year, number: props.number}));
    //console.log(index)
    if (index !== -1) {
      var arr = removeItemOnce(this.state.coursesSelectedToDelete, JSON.stringify({year: props.year, number: props.number}))
      this.setState({coursesSelectedToDelete: arr}, () => {
        console.log(this.state.coursesSelectedToDelete)
      });
    } else {
      this.setState({coursesSelectedToDelete:[...this.state.coursesSelectedToDelete, JSON.stringify({year: props.year, number: props.number})]}, () => {
        console.log(this.state.coursesSelectedToDelete)
      })
    }
  } 
  
  
  selectRow = {
    mode: "checkbox",
    clickToSelect: false,
    classes: "selection-row",
    onSelect: this.onSelect
  };


    
    getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
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
      this.props.navbar(true);
      fetch('http://localhost:3000/api/courses/', {method:'GET', 
      headers: {'Authorization': 'Basic ' + btoa('username:password')}})
      .then((response) => {
        return response.json()
      })
      .then (data => {
        this.setState(data, () => {
          console.log(this.state)
        });
      });
    }

    render(){
      return (

      <React.Fragment>
      <BootstrapTable selectRow={this.selectRow} hover keyField='number' data={ this.state.elements } columns={ this.columns } />
            {/* <AddUserModal history={this.props.history}></AddUserModal> */}
            <Button  variant="primary" id= "deleteCourseBut" onClick={this.deleteSelectedCourses}>
                Delete Selected courses
            </Button>
      </React.Fragment>


      );
      }
  
   }
  export default withRouter(Courses);


  //TODO: 

// 1. Add the student/stuff section in the table.
// 2. create course detail components.
//
