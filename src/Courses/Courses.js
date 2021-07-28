import React,{useState} from "react";
import { Component } from "react";
import { withRouter } from "react-router-dom";
import "./Courses.css"
import BootstrapTable from 'react-bootstrap-table-next';
import Button from "react-bootstrap/Button"
import Form from "react-bootstrap/Form"
import Modal from "react-bootstrap/Modal"
import Col from "react-bootstrap/Col"
import {getCookie} from  "../Utils/session"

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
    this.state = {left_to_process:false,limit:5, after_id:0,coursesSelectedToDelete: [], elements: [], isAdminView: false
  };
  this.componentDidMount=this.componentDidMount.bind(this);
  this.deleteSelectedCourses=this.deleteSelectedCourses.bind(this);
  this.onSelect=this.onSelect.bind(this);
  this.goToBackEnd=this.goToBackEnd.bind(this);
  this.nextPage=this.nextPage.bind(this);
  this.previousPage=this.previousPage.bind(this);
  }


  nextPage = () => {
    this.setState({after_id: this.state.after_id + this.state.limit}, () => {
        this.goToBackEnd()
    })
  }

  previousPage = () => {
    this.setState({after_id: this.state.after_id - this.state.limit}, () => {
        this.goToBackEnd()
    })
  }

  deleteSelectedCourses = () => {
    this.state.coursesSelectedToDelete.forEach( (course) => {
        course = JSON.parse(course)
        fetch(window.location.origin + '/api/courses/' + course.number + "/" + course.year, {method:'DELETE', 
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
    text: 'Year',
    // formatter: (cell, row) => {
    //   console.log(row);
    //   return <div>{`${row.year} : ${row.number}`}</div>;
    // }
  },
  {
    dataField: 'number',
    text: 'Course number'
  },
];

  onSelect = (props) => {
    var index = this.state.coursesSelectedToDelete.indexOf(JSON.stringify({year: props.year, number: props.number}));
    if (index !== -1) {
      var arr = removeItemOnce(this.state.coursesSelectedToDelete, JSON.stringify({year: props.year, number: props.number}))
      this.setState({coursesSelectedToDelete: arr});
    } else {
      this.setState({coursesSelectedToDelete:[...this.state.coursesSelectedToDelete, JSON.stringify({year: props.year, number: props.number})]})
    }
  } 
  
  
  selectRow = {
    mode: "checkbox",
    clickToSelect: false,
    classes: "selection-row",
    onSelect: this.onSelect
  };

    componentDidMount() {
      this.props.navbar(true);
      this.setState({isAdminView: checkAdminCookie()}, () => {
        this.goToBackEnd();
      })
    }

    goToBackEnd() {
      if (this.state.isAdminView){
        var header = {}
      } else {
        header = {'X-Submit-User': getUserNameFromCookie() }
      }
      var toRet=[]
      var url = window.location.origin + '/api/courses/?limit='+ this.state.limit
      if (this.state.after_id > 0) {
        url = url + "&after_id=" + this.state.after_id
      }
      fetch(url, {method:'GET', 
      headers: header})
      .then((response) => {
        if (response.headers.has("X-Elements-Left-To-Process")){
            this.setState({left_to_process:true})
        } else {
            this.setState({left_to_process:false})
        }
        return response.json()
      })
      .then (data => {
        if (data.elements !== undefined ) {
          data.elements.forEach((element) => {
            element.id=this.getRandomInt(1,100000000);
            toRet.push(element)
          })
        }

        this.setState({elements:toRet});
      });
    }

     getRandomInt(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
  }



    render(){
      return (

      <React.Fragment>
      {this.state.isAdminView && <BootstrapTable selectRow={this.selectRow} hover keyField='id' data={ this.state.elements } columns={ this.columns } />}
      {!this.state.isAdminView && <BootstrapTable  hover keyField='id' data={ this.state.elements } columns={ this.columns } />}
            {this.state.isAdminView && <AddCourserModal history={this.props.history}></AddCourserModal>}
            {this.state.isAdminView && <Button  variant="primary" id= "deleteCourseBut" onClick={this.deleteSelectedCourses}>
                Delete Selected courses
            </Button>}
            {this.state.after_id > 0 && <Button  variant="primary" id= "UsersPrevPage" onClick={this.previousPage}>
                Previons page
            </Button>}
            {this.state.left_to_process === true && <Button  variant="primary" id= "UsersNextPage" onClick={this.nextPage}>
                Next page
            </Button>}
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
        var body = { number: parseInt(event.target.number.value), name: event.target.name.value , year: 2021}
        fetch(window.location.origin + '/api/courses/', {method:'POST', 
        body: JSON.stringify(body), headers: {'Authorization': 'Basic ' + btoa('username:password')}})
        .then((response) => {
          console.log(body)
          var resp = response.json()
          console.log(resp)
          if (!response.ok){
            alert("failed to create course")
          }
          return resp
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
            <Form.Group controlId="name" >
                <Form.Label>Name: </Form.Label>
                <Form.Control placeholder="Enter last name"/>
            </Form.Group>
            <Button id="submitAddCourseBut" variant="primary" type="submit">
                Submit
            </Button>
            <Button id="closeAddCourseBut" variant="primary" onClick={handleClose}>
              Close
            </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </>
    );
  }
  function parseResp(str){ 
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
  
  function checkAdminCookie(){
    var state_cookie = getCookie("submit-last-server-state");
    if (state_cookie !== undefined){
      var roles = JSON.parse(state_cookie).roles;
    }
    return parseResp(JSON.stringify(roles)) === "Admin"
  }

  function getUserNameFromCookie() {
    var state_cookie = getCookie("submit-last-server-state");
    if (state_cookie !== undefined){
      var user_name = JSON.parse(state_cookie).user_name;
    }
    return user_name
  }
    


  export default withRouter(Courses);


  //TODO: 

// 1. Add the student/stuff section in the table.
// 2. create course detail components.
//
