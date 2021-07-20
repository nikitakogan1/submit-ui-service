import React, { useEffect } from "react";
import { Component } from "react";
import { withRouter,Route, Redirect } from "react-router-dom";
import "./User.css"
import Col from "react-bootstrap/Col"
import Form from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"
import  { useState } from 'react';
import Modal from "react-bootstrap/Modal"
import FormGroup from "react-bootstrap/FormGroup"
import DropdownMultiselect from "react-multiselect-dropdown-bootstrap";
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import Multiselect from 'multiselect-react-dropdown';



class User extends Component {
    userURL = ""
    userNameFromReq = ""
    username = ""
    constructor(props) {
      super(props);
      this.state = 
        {alertFailure:false, alertSuccess: false,user_name:"",first_name:"",last_name:"", email:"", roles:{"elements":{}},courses_as_student:{"elements":{}},courses_as_staff:{"elements":{}}};
    this.componentDidMount=this.componentDidMount.bind(this);
    this.checkAdmin=this.checkAdmin.bind(this);
    }
    
      updateDetails = (event) => {
        event.preventDefault(event);
        console.log(event.target.Admin.checked)
        console.log(event.target.Secretary.checked)
        console.log(event.target.standartUser.checked)
        var roles = this.state.roles;
        if (event.target.standartUser.checked){
          roles = {"elements":{"std_user":{}}}
        }
        if (event.target.Secretary.checked){
          roles = {"elements":{"secretary":{}}}
        }
        if (event.target.Admin.checked){
          roles = {"elements":{"admin":{}}}
        }
        var body = {"user_name":this.state.user_name,"last_name":event.target.last_name.value, "email": event.target.email.value, "first_name":event.target.first_name.value,"password":this.state.password,
        "roles":roles,"courses_as_student":this.state.courses_as_student,"courses_as_staff":this.state.courses_as_staff}
        console.log( JSON.stringify(body))
         fetch('http://localhost:3000/api/users/' + this.userNameFromReq , {method:'PUT', 
         body: JSON.stringify(body), headers: {'Authorization': 'Basic ' + btoa('username:password')}})
         .then((response) => {
          if (response.ok) {
            this.setState({alertSuccess: true})
          } else {
            this.setState({alertFailure: true})
          }
          return response.json()
         })
         .then (data => {
           console.log(data);
         });
         this.props.history.go(0)
    }


     componentDidMount() {
        this.userNameFromReq = this.props.match.params.id
        var state_cookie = getCookie("submit-last-server-state");
        console.log("the state cookie is" ,state_cookie)
        this.username = JSON.parse(state_cookie).user_name;
        console.log("the username is", this.username);
        this.userURL = "http://localhost:3000/api/users/" + this.userNameFromReq
        fetch(this.userURL, {method:'GET', 
        headers: {'Authorization': 'Basic ' + btoa('username:password')}})
        .then((response) => {
            return response.json()
        })
        .then (data => {
            this.setState(data);
            console.log("final state is",this.state);
        });
        this.checkAdmin()
        console.log("proooooooops:",this.props)
        this.props.navbar(true)
    }

    parseResp(str){ 
      console.log("parse resp",str)
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

    checkAdmin() {
      if (this.parseResp(JSON.stringify(this.state.roles.elements)) === "Admin") {
        return true
      }
      return false
    }

    checkAdminCookie(){
      var state_cookie = getCookie("submit-last-server-state");
      if (state_cookie !== undefined){
        console.log(state_cookie);
        var roles = JSON.parse(state_cookie).roles;
      }
      return this.parseResp(JSON.stringify(roles)) === "Admin"
    }

    courseOnClick = (course) => {
      console.log(course)
      this.props.history.push("/courses/" + course.replaceAll(":","/"))
    }

    render() {
        console.log("the state before sending is", this.parseResp(JSON.stringify(this.state.roles.elements)))
        return (
          <React.Fragment>
<Form onSubmit={this.updateDetails}>
  <Form.Row>
    <Form.Group as={Col} controlId="user_name">
      <Form.Label>User name:</Form.Label>
      <Form.Control type="user name" placeholder="Enter username" disabled value={this.state.user_name} />
    </Form.Group>
  </Form.Row>

  <Form.Group controlId="first_name">
    <Form.Label>First name: </Form.Label>
    <Form.Control defaultValue={this.state.first_name} />
  </Form.Group>

  <Form.Group controlId="last_name">
    <Form.Label>Last name: </Form.Label>
    <Form.Control defaultValue={this.state.last_name} />
  </Form.Group>

  <Form.Row>
    <Form.Group controlId="email">
      <Form.Label>Email: </Form.Label>
      <Form.Control defaultValue={this.state.email} />
  </Form.Group>

Roles:
{this.checkAdminCookie() ? (this.parseResp(JSON.stringify(this.state.roles.elements)) !== "None" && <AdminUserRoles role={ this.parseResp(JSON.stringify(this.state.roles.elements))}></AdminUserRoles>) : <UserRoles></UserRoles>}
  </Form.Row>
  <Button variant="primary" type="submit">
    Submit
  </Button>
  {this.state.alertSuccess && <AlertSuccess></AlertSuccess>}
  {this.state.alertFailure && <AlertFailed></AlertFailed>}
</Form>
{(this.state.courses_as_student.elements !== {} ||  this.state.courses_as_staff.elements !== {}) && <UserCourses courseOnClick={this.courseOnClick} user_name={this.state.user_name} studentCourses={this.state.courses_as_student.elements} staffCourses={this.state.courses_as_staff.elements} history={this.props.history}></UserCourses>}
<div className="adminPanel">
{this.checkAdminCookie() && <AddUserToCourseAsStudentModal history={this.props.history} courses_as_staff={this.state.courses_as_staff} courses_as_student={this.state.courses_as_student} user_name={this.state.user_name} userURL={'http://localhost:3000/api/users/' + this.state.user_name}></AddUserToCourseAsStudentModal>}
{this.checkAdminCookie() && <AddUserToCourseAsStaffModal history={this.props.history} courses_as_staff={this.state.courses_as_staff} user_name={this.state.user_name} userURL={'http://localhost:3000/api/users/' + this.state.user_name}></AddUserToCourseAsStaffModal>}
</div>
</React.Fragment>

)}
}
 


class AdminUserRoles extends Component {
  constructor(props){
    super(props)
    this.state = {
      isAdmin: false, isSec: false, isStdUsr: false, isAgent: false
    }
    this.componentDidMount = this.componentDidMount.bind(this)
  }


  componentDidMount() {
    var role = this.props.role
    console.log("the role is",role)
    if (role === "Admin"){
      this.setState({isAdmin : true})
    }
    if (role === "Secretary"){
      this.setState({isSec : true})
    }
    if (role === "User"){
      this.setState({isStdUsr : true})
    }
    if (role === "Agent"){
      this.setState({isAgent : true})
    }
  }
  render () {
    return <div className="RolesRadio">
      <fieldset>
      <FormGroup>
      <Form.Check
      type="radio"
      label={`Admin`}
      id={`Admin`}
      onChange={e => {
        this.setState({isAdmin : e.currentTarget.checked})
        this.setState({isSec : !e.currentTarget.checked})
        this.setState({isAgent : !e.currentTarget.checked})
        this.setState({isStdUsr : !e.currentTarget.checked})

      }
      }
      checked={this.state.isAdmin === true}
      />
      <Form.Check
      type="radio"
      label={`Agent`}
      id={`Agent`}
      checked={this.state.isAgent === true}
      onChange={e =>{
        this.setState({isAdmin : !e.currentTarget.checked})
        this.setState({isSec : !e.currentTarget.checked})
        this.setState({isAgent : e.currentTarget.checked})
        this.setState({isStdUsr : !e.currentTarget.checked})
      }
      }
      />
      <Form.Check
      onChange={e => {
        this.setState({isAdmin : !e.currentTarget.checked})
        this.setState({isSec : e.currentTarget.checked})
        this.setState({isAgent : !e.currentTarget.checked})
        this.setState({isStdUsr : !e.currentTarget.checked})
      }}
      type="radio"
      label={`Secretary`}
      id={`Secretary`}
      checked={this.state.isSec === true}

      />
      <Form.Check
      onChange={e => {
        this.setState({isAdmin : !e.currentTarget.checked})
        this.setState({isSec : !e.currentTarget.checked})
        this.setState({isAgent : !e.currentTarget.checked})
        this.setState({isStdUsr : e.currentTarget.checked})
      }}
      type="radio"
      label={`Standart user`}
      id={`standartUser`}
      checked={this.state.isStdUsr === true}
      />
      </FormGroup>
  </fieldset>      
  </div>
  }
  
}


const UserRoles = () => {
return (
  <div key={`Admin`} className="mb-3">
  <Form.Check
    disabled
    type="radio"
    label={`radio`}
    id={`Admin`}
  />
  <Form.Check
    disabled
    type="radio"
    label={`Agent`}
    id={`Agent`}
  />
  <Form.Check
    disabled
    type="radio"
    label={`Secretary`}
    id={`Secretary`}
  />
  <Form.Check
    disabled
    type="radio"
    label={`Standart user`}
    id={`standartUser`}
    defaultChecked
  />
</div>
)
}

const createTableWithCourses = (as_student, as_staff) => {
  var studentCoursesToRet=[]
  var staffCoursesToRet=[]

  as_student.forEach((course) => {
    console.log(course)
    const [number,year] = course.split(":");
    studentCoursesToRet.push({number: number, year: year})
    console.log(studentCoursesToRet)
  })
 
  as_staff.forEach((course) => {
    console.log(course)
    const [number,year] = course.split(":");
    staffCoursesToRet.push({number: number, year: year})
    console.log(staffCoursesToRet)
  })
  return [studentCoursesToRet,staffCoursesToRet]
}

class UserCourses extends Component {
  constructor(props){
    super(props);
    this.state = {
      coursesSelectedToDelete:[], staffCoursesSelectedToDelete:[], studentCoursesList:[], staffCoursesList:[]
    }
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

 componentDidMount() {
   console.log("Xxxxxxx",this.props.studentCourses)
  this.setState({studentCoursesList:this.props.studentCourses}, () => {
    console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",this.state.studentCoursesList)
  })
  this.setState({staffCoursesList:Object.keys(this.props.staffCourses)})
 }

  onSelectStudentTable = (props) => {
    var arr=[]
    var index = this.state.coursesSelectedToDelete.indexOf(JSON.stringify({year: props.year, number: props.number}));
    if (index !== -1) {
      arr = removeItemOnce(this.state.coursesSelectedToDelete, JSON.stringify({year: props.year, number: props.number}))
      this.setState({coursesSelectedToDelete: arr}, () => {
        console.log(this.state.coursesSelectedToDelete)
      });
    } else {
      arr = [...this.state.coursesSelectedToDelete, JSON.stringify({year: props.year, number: props.number})]
      arr.forEach((course) => {
        course = course.replaceAll("\\","");
      })
      this.setState({coursesSelectedToDelete:arr}, () => {
        console.log(this.state.coursesSelectedToDelete)
      })
    }
  } 

  onSelectStaffTable = (props) => {
    var arr=[]
    var index = this.state.staffCoursesSelectedToDelete.indexOf(JSON.stringify({year: props.year, number: props.number}));
    if (index !== -1) {
      arr = removeItemOnce(this.state.staffCoursesSelectedToDelete, JSON.stringify({year: props.year, number: props.number}))
      this.setState({staffCoursesSelectedToDelete: arr}, () => {
        console.log(this.state.staffCoursesSelectedToDelete)
      });
    } else {
      arr = [...this.state.staffCoursesSelectedToDelete, JSON.stringify({year: props.year, number: props.number})]
      arr.forEach((course) => {
        course = course.replaceAll("\\","");
      })
      this.setState({staffCoursesSelectedToDelete:arr}, () => {
        console.log(this.state.staffCoursesSelectedToDelete)
      })
    }
  } 




  removeItemOnce(arr, value) {
    var index = arr.indexOf(value);
    if (index > -1) {
      arr.splice(index, 1);
    }
    return arr;
  }


  deleteSelectedCoursesAsStudent = () => {
    console.log("hine:",this.state.coursesSelectedToDelete)
    console.log("prop1", this.props.studentCourses);
    var body = {username: this.props.user_name, courses_as_student:{elements:this.props.studentCourses}}
    this.state.coursesSelectedToDelete.forEach((course) => {
      course = JSON.parse(course)
      var toRemove = course.number + ":" + course.year
      if (Object.keys(body.courses_as_student.elements).includes(toRemove)){
        delete body.courses_as_student.elements[toRemove]
        console.log("it works")
      }
      console.log(body)
    })

    fetch('http://localhost:3000/api/users/' + this.props.user_name , {method:'PUT', body: JSON.stringify(body),
    headers: {'Authorization': 'Basic ' + btoa('username:password')}})
    .then((response) => {
    if (!response.ok){
        alert("balagan")
    }
    return response.json()
    });
    this.props.history.go(0)
}

deleteSelectedCoursesAsStaff = () => {
  console.log("hine:",this.state.staffCoursesSelectedToDelete)
  console.log("prop1", this.props.staffCourses);
  var body = {username: this.props.user_name, courses_as_staff:{elements:this.props.staffCourses}}
  this.state.staffCoursesSelectedToDelete.forEach((course) => {
    course = JSON.parse(course)
    var toRemove = course.number + ":" + course.year
    if (Object.keys(body.courses_as_staff.elements).includes(toRemove)){
      delete body.courses_as_staff.elements[toRemove]
      console.log("it works")
    }
    console.log(body)
  })

  fetch('http://localhost:3000/api/users/' + this.props.user_name , {method:'PUT', body: JSON.stringify(body),
  headers: {'Authorization': 'Basic ' + btoa('username:password')}})
  .then((response) => {
  if (!response.ok){
      alert("balagan")
  }
  return response.json()
  });
  this.props.history.go(0)
}


  selectRowStudent = {
    mode: "checkbox",
    clickToSelect: false,
    classes: "selection-row",
    onSelect: this.onSelectStudentTable
  };

  selectRowStaff = {
    mode: "checkbox",
    clickToSelect: false,
    classes: "selection-row",
    onSelect: this.onSelectStaffTable
  };


render(){
  var studentCoursesList = Object.keys(this.props.studentCourses)
  var staffCoursesList = Object.keys(this.props.staffCourses)
  const [as_student,as_staff] = createTableWithCourses(studentCoursesList,staffCoursesList)
  return (
    <div className="tables">
    <React.Fragment>
    {studentCoursesList.length !== 0 && <BootstrapTable id= "userCoursesTable" selectRow={this.selectRowStudent} hover keyField='number' data={as_student} columns={ this.columns } pagination={ paginationFactory(PagingOptions) } />}
    {staffCoursesList.length !== 0 && <BootstrapTable id= "staffCoursesTable" selectRow={this.selectRowStaff} hover keyField='number' data={as_staff} columns={ this.columns }  pagination={ paginationFactory(PagingOptions) }
/>}
    </React.Fragment>
    <Button  variant="secondary" id= "deleteCourseButInUser" onClick={this.deleteSelectedCoursesAsStudent}>
                Delete Selected courses as student
            </Button>
            <Button  variant="secondary" id= "deleteCourseButInStaff" onClick={this.deleteSelectedCoursesAsStaff}>
                Delete Selected courses as staff
            </Button>
    </div>
  )
}


}

const PagingOptions = {
  page: 1,
  sizePerPage: 1,
  nextPageText: '>',
  prePageText: '<',
  hideSizePerPage: true, // hide the size per page dropdown
  showTotal: false,
};

const AlertSuccess = () => {
    return (
      <div class="alert alert-success" role="alert">
      User data updated successfully!
      </div>
    )
}

  const AlertFailed = () => {
    return (
     <div class="alert alert-danger" role="alert">
       Failed to update user data! try again!
     </div>
    )
}

export const UserPrivateRoute = ({ component: Component, ...rest }) => {

  // Add your own authentication on the below line.
  const isLoggedIn = userAuthFunc()
  
  return (
    <Route
      {...rest}
      render={props =>
        isLoggedIn ? (
          <Component {...props} {...rest} />
        ) : (
          <Redirect to={{ pathname: '/' }} />
        )
      }
    />
  )
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

function setCookie(name,value,days) {
  var expires = "";
  if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days*24*60*60*1000));
      expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

const userAuthFunc = () => {
  var cookie = getCookie("submit-server-cookie")
  var stateCookie = getCookie("submit-last-server-state")
  if (cookie === undefined || stateCookie === undefined) {
    setCookie('submit-last-visited-path', window.location.pathname, 0.0034);
   return false
  }
  return true
}

function AddUserToCourseAsStudentModal(props) {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);


  return (
    <>
      <Button id="addUserAsStudent" variant="primary" onClick={handleShow}>
        Add user to course as student
      </Button>

      <Modal show={show} onHide={handleClose} animation={false}>
        <Modal.Header closeButton>
          <Modal.Title>Choose course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
<GetCoursesList role={"student"} history={props.history} courses_as_staff={props.courses_as_staff} courses_as_student={props.courses_as_student} close={handleClose} userURL={props.userURL} user_name={props.user_name}></GetCoursesList>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

function AddUserToCourseAsStaffModal(props) {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);


  return (
    <>
      <Button id="addUserAsStaff" variant="primary" onClick={handleShow}>
        Add user to course as staff
      </Button>

      <Modal show={show} onHide={handleClose} animation={false}>
        <Modal.Header closeButton>
          <Modal.Title>Choose course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
<GetCoursesList role={"staff"} history={props.history} courses_as_student={props.courses_as_student} courses_as_staff={props.courses_as_staff} close={handleClose} userURL={props.userURL} user_name={props.user_name}></GetCoursesList>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

function removeItemOnce(arr, value) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}


class GetCoursesList extends Component {
  constructor(props){
    super(props)
    this.state = {checked: null,selected:[],coursesList:[],elements:[], coursesListAsStaff: [], checkedStaff: null}
    this.componentDidMount=this.componentDidMount.bind(this);
    this.updateCoursesAsStudent=this.updateCoursesAsStudent.bind(this);
    this.parseAnswerCoursesAsStudent=this.parseAnswerCoursesAsStudent.bind(this)
    this.parseAnswerCoursesAsStaff = this.parseAnswerCoursesAsStaff.bind(this);
    this.onSelect=this.onSelect.bind(this);
    this.onRemove=this.onRemove.bind(this);
  }

  async componentDidMount(){
    var coursesURL = "http://localhost:3000/api/courses/"
    await fetch(coursesURL, {method:'GET', 
    headers: {'Authorization': 'Basic ' + btoa('username:password')}})
    .then((response) => {
        return response.json()
    })
    .then (data => {
        this.setState({elements : data}, () => {
          if (this.props.role === "staff"){
            var coursesStaff = parseCourses(this.state.elements.elements)
            // var coursesOfStudent = Object.keys(this.props.courses_as_student.elements)
            this.setState({coursesListAsStaff: coursesStaff}, () => {
              this.parseAnswerCoursesAsStaff()
            })
          } else {
            var coursesStudent = parseCourses(this.state.elements.elements)
            var coursesOfStaff = Object.keys(this.props.courses_as_staff.elements)
            coursesStudent.forEach((course) => {
              var [number,year, name ] = course.split("/")
              number = number.trim()
              year = year.trim()
              const numberAndYear = number + ":" + year
              console.log(numberAndYear)
              if (coursesOfStaff.includes(numberAndYear)){
                coursesStudent = removeItemOnce(coursesStudent, course)
              }
            })
            this.setState({coursesList:coursesStudent}, () => {
              this.parseAnswerCoursesAsStudent()
            })
          }
        })
    });

  }



  updateCoursesAsStudent = () => {
    var body = {user_name: this.props.user_name, courses_as_student:{elements:{}}}
    var coursesToStore = []
    this.state.selected.forEach((course) => {
      var [number,year] = course.name.split("/")
      number = number.trim()
      year = year.trim()
      coursesToStore.push((number+":"+year).trim())
    })
    coursesToStore.forEach((course) => {
      body.courses_as_student.elements[course] = {}
    })
    console.log(JSON.stringify(body))
    fetch(this.props.userURL, {method:'PUT', 
     body: (JSON.stringify(body)),headers: {'Authorization': 'Basic ' + btoa('username:password')}})
    .then((response) => {
        return response.json()
    })
    this.props.close()
    this.props.history.go(0)
    console.log("vvvvvvvv",this.state.selected)
  }

  updateCoursesAsStaff = () => {
    var body = {user_name: this.props.user_name, courses_as_staff:{elements:{}}}
    var coursesToStore = []
    this.state.selected.forEach((course) => {
      var [number,year] = course.name.split("/")
      number = number.trim()
      year = year.trim()
      coursesToStore.push((number+":"+year).trim())
    })
    coursesToStore.forEach((course) => {
      body.courses_as_staff.elements[course] = {}
    })
    
    console.log("body",body)
    fetch(this.props.userURL, {method:'PUT', 
     body: (JSON.stringify(body)),headers: {'Authorization': 'Basic ' + btoa('username:password')}})
    .then((response) => {
        console.log("respppppppppppppppppppppppppp:",response)
        return response.json()
    })
    this.props.close()
    this.props.history.go(0)
  }


  parseAnswerCoursesAsStudent(){
    var checkedCoursesToRet = []
    if (this.props.courses_as_student !== undefined){
      var coursesFromProps= Object.keys(this.props.courses_as_student.elements);
    } else {
      coursesFromProps=[]
    }
    
    console.log("parsed answer",coursesFromProps);
    this.state.coursesList.forEach( (course) => {
      coursesFromProps.forEach( (course2) => {
        var [number,year] = course.split("/")
        var [number2,year2] = course2.split(":")
        if (number.trim() === number2.trim() && year.trim() === year2.trim()){
          checkedCoursesToRet.push(course)
        }
      })
    })
    var toRet=[]
    checkedCoursesToRet.forEach((course)=> {
      toRet.push({name: course, id:course})
    })
    this.setState({checked: toRet}, () => {
      console.log("checked courses for student",this.remove_duplicates(toRet))
    })
  }


  parseAnswerCoursesAsStaff(){
    var checkedCoursesToRet = []
    var coursesFromProps= Object.keys(this.props.courses_as_staff.elements);
    
    this.state.coursesListAsStaff.forEach( (course) => {
      coursesFromProps.forEach( (course2) => {
        var [number,year] = course.split("/")
        var [number2,year2] = course2.split(":")
        if (number.trim() === number2.trim() && year.trim() === year2.trim()){
          checkedCoursesToRet.push(course)
        }
      })
    })
    var toRet=[]
    checkedCoursesToRet.forEach((course)=> {
      toRet.push({name: course, id:course})
    })
    this.setState({checkedStaff: toRet}, () => {
      console.log("checked courses for staff",this.remove_duplicates(checkedCoursesToRet))
    })
  }

  remove_duplicates(arr) {
    var obj = {};
    var ret_arr = [];
    for (var i = 0; i < arr.length; i++) {
        obj[arr[i]] = true;
    }
    for (var key in obj) {
        ret_arr.push(key);
    }
    return ret_arr;
}

  onSelect(selectedList, selectedItem) {
    this.setState({selected: selectedList})
  }

  onRemove(selectedList, removedItem) {
    this.setState({checkedStaff: selectedList})
  }


  render() {
    var checked;
    var applyFunc;
    var options;
    console.log(this.props.role)
    if (this.props.role === "staff"){
      options = this.state.coursesListAsStaff;
      checked = this.state.checkedStaff;
      applyFunc=this.updateCoursesAsStaff
    } else {
      options = this.state.coursesList;
      checked = this.state.checked;
      applyFunc=this.updateCoursesAsStudent;
    }
    console.log("options",options)
    var finalOptions = []
    options.forEach((option) => {
      option = {name: option, id: option}
      finalOptions.push(option)
    })
    console.log("beeeeeeee,",options)
    return (
<React.Fragment>
{options !== null && options.length !== 0 && checked !== null && <Multiselect
      options={finalOptions}
      // name="courses"
      onRemove={this.onRemove}
      onSelect={this.onSelect}
      selectedValues={checked}
      disablePreSelectedValues
      displayValue="name" // Property name to display in the dropdown options

    />}
      <Button variant="primary" id="submitAddCourse" onClick={applyFunc}>
      Save Changes
    </Button>
</React.Fragment>
    )
  }

}




const parseCourses = (coursesList) => {
  var courses=[]
  if (coursesList === undefined){
    return []
  }
  for (let i = 0; i < coursesList.length; i++) {
   courses[i] = coursesList[i].number + " / " + coursesList[i].year + " / " + coursesList[i].name
 }
 return courses
}

  export default withRouter(User);

