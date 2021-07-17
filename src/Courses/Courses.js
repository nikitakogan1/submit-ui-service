import React,{useState} from "react";
import { Component } from "react";
import { withRouter } from "react-router-dom";
import "./Courses.css"
import BootstrapTable from 'react-bootstrap-table-next';
import Button from "react-bootstrap/Button"
import Form from "react-bootstrap/Form"
import Modal from "react-bootstrap/Modal"
import Col from "react-bootstrap/Col"

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
    var index = this.state.coursesSelectedToDelete.indexOf(JSON.stringify({year: props.year, number: props.number}));
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
            <AddCourserModal history={this.props.history}></AddCourserModal>
            <Button  variant="primary" id= "deleteCourseBut" onClick={this.deleteSelectedCourses}>
                Delete Selected courses
            </Button>
      </React.Fragment>


      );
      }
  
   }


   export function AddCourserModal(props) {
    const [show, setShow] = useState(false);
  
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const createCourse = (event) => {
        event.preventDefault(event);
        console.log(event.target.number.value)
        console.log(event.target.year.value)
        console.log(event.target.name.value)
        var body = { number: parseInt(event.target.number.value), year: parseInt(event.target.year.value), name: event.target.name.value }
        console.log(body)
        fetch('http://localhost:3000/api/courses/', {method:'POST', 
        body: JSON.stringify(body), headers: {'Authorization': 'Basic ' + btoa('username:password')}})
        .then((response) => {
          if (!response.ok){
            alert("balagan")
          }
          return response.json()
        });
        handleClose()
        props.history.go(0)
    }

    

    return (
      <>
        <Button id="addCourse" variant="primary" onClick={handleShow}>
          Add course
        </Button>
  
        <Modal id="addCourseModal" show={show} onHide={handleClose} animation={false}>
            <Modal.Title id= "AddCoursetitle">Create course</Modal.Title>
        <Modal.Body>

          <Form  id="addCourseForm" onSubmit={createCourse}>
            <Form.Row>
                <Form.Group as={Col} controlId="number">
                <Form.Label>Number:</Form.Label>
                <Form.Control placeholder="Enter course number" />
                </Form.Group>
            </Form.Row>

            <Form.Group controlId="year"> 
                <Form.Label>Year: </Form.Label>
                <Form.Control placeholder="Enter course year"  />
            </Form.Group>

            <Form.Group controlId="name" >
                <Form.Label>Name: </Form.Label>
                <Form.Control placeholder="Enter last name"/>
            </Form.Group>
            <Button id="submitAddCourseBut" variant="primary" type="submit">
                Submit
            </Button>
            <Button id="closeAddCourseBut" variant="secondary" onClick={handleClose}>
              Close
            </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </>
    );
  }



  export default withRouter(Courses);


  //TODO: 

// 1. Add the student/stuff section in the table.
// 2. create course detail components.
//
