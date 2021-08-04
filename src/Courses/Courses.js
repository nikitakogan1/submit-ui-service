import React,{useState} from "react";
import { Component } from "react";
import { withRouter } from "react-router-dom";
import "./Courses.css"
import BootstrapTable from 'react-bootstrap-table-next';
import Button from "react-bootstrap/Button"
import Form from "react-bootstrap/Form"
import Modal from "react-bootstrap/Modal"
import Col from "react-bootstrap/Col"
import {getCookie, isLoggedIn} from  "../Utils/session"

class Courses extends Component {

  constructor(props) {
    super(props);
    this.state = {left_to_process:false,limit:5, after_id:0,courseToDelete: null, elements: [], isAdminView: false
  };
  this.componentDidMount=this.componentDidMount.bind(this);
  this.deleteCourse=this.deleteCourse.bind(this);
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

  deleteCourse = () => {
    var course = JSON.parse(this.state.courseToDelete);
    fetch(window.location.origin + '/api/courses/' + course.number + "/" + course.year, {method:'DELETE', 
    headers: {'Authorization': 'Basic ' + btoa('username:password')}})
    .then((response) => {
    if (!response.ok){
        alert("balagan")
    }
    return response.json()
    });
    this.props.history.go(0)
}

  columns = [{
    dataField: 'name',
    text: 'Course name',
    formatter: (cell, row) => <a href={"/courses/" + row.number + "/" + row.year}> {cell} </a>,
  }, {
    dataField: 'year',
    text: 'Year',
  },
  {
    dataField: 'number',
    text: 'Course number'
  },
];

  onSelect = (props) => {
         this.setState({courseToDelete: JSON.stringify({year: props.year, number: props.number})})
  } 
  
  
  selectRow = {
    mode: "radio",
    clickToSelect: false,
    classes: "selection-row",
    onSelect: this.onSelect,
    hideSelectAll: true
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
        if (data.elements !== undefined && data.elements !== null && data.elements !== []) {
          data.elements.forEach((element) => {
            element.id= element.year + ":" + element.number
            toRet.push(element)
          })
        }

        this.setState({elements:toRet});
      });
    }



    render(){
      return (
      <React.Fragment>
      {(this.state.elements.length === 0 || this.state.elements === null || this.state.elements === undefined ) && <AlertNoCourses></AlertNoCourses>}
      {this.state.isAdminView && (this.state.elements.length !== 0 && this.state.elements !== null && this.state.elements !== undefined) && <BootstrapTable selectRow={this.selectRow} hover keyField='id' data={ this.state.elements } columns={ this.columns } />}
      {!this.state.isAdminView && (this.state.elements.length !== 0 && this.state.elements !== null && this.state.elements !== undefined) && <BootstrapTable  hover keyField='id' data={ this.state.elements } columns={ this.columns } />}
            {this.state.isAdminView && <AddCourserModal history={this.props.history}></AddCourserModal>}
            {this.state.isAdminView && (this.state.elements.length !== 0 && this.state.elements !== null && this.state.elements !== undefined) && <Button  variant="primary" id= "deleteCourseBut" onClick={this.deleteCourse}>
                Delete
            </Button>}
            {this.state.after_id > 0 && <Button  variant="primary" id= "CoursesPrevPage" onClick={this.previousPage}>
                Previons page
            </Button>}
            {this.state.left_to_process === true && <Button  variant="primary" id= "CoursesNextPage" onClick={this.nextPage}>
                Next page
            </Button>}
      </React.Fragment>
      );
      }
  
   }

   const AlertNoCourses = () => <div class="alert alert-info" role="alert">No Courses Yet...</div>;

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
    let roles;
    if (!isLoggedIn()) {
      roles = []
    } else {
      let state_cookie = getCookie("submit-last-server-state");
      roles = JSON.parse(state_cookie).roles;
    }
    return parseResp(JSON.stringify(roles)) === "Admin"
  }

  function getUserNameFromCookie() {
    let user_name = "";
    if (isLoggedIn()) {
      let state_cookie = getCookie("submit-last-server-state");
      user_name = JSON.parse(state_cookie).user_name;
    }
    return user_name
  }
    


  export default withRouter(Courses);

