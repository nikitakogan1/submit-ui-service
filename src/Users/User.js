import {Fragment} from "react";
import { Component } from "react";
import { withRouter } from "react-router-dom";
import "./User.css"
import Col from "react-bootstrap/Col"
import Form from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"
import  { useState } from 'react';
import Modal from "react-bootstrap/Modal"
import FormGroup from "react-bootstrap/FormGroup"
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import Multiselect from 'multiselect-react-dropdown';
import {getCookie} from  "../Utils/session";
import { Modal as DavidModal }  from 'react-responsive-modal';


class User extends Component {
    userURL = ""
    userNameFromReq = ""
    username = ""
    constructor(props) {
      super(props);
      this.state = 
        {showCoursesManagmentModal: false, alertFailure:false, alertSuccess: false,user_name:"",first_name:"",last_name:"", email:"", roles:{"elements":{}},courses_as_student:{"elements":{}},courses_as_staff:{"elements":{}}};
    this.componentDidMount=this.componentDidMount.bind(this);
    this.checkAdmin=this.checkAdmin.bind(this);
    this.handleCloseModal=this.handleCloseModal.bind(this);
    this.handleShowModal=this.handleShowModal.bind(this);
    }
    
      updateDetails = (event) => {
        event.preventDefault(event);
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
        if (event.target.Agent.checked){
          roles = {"elements":{"agent":{}}}
        }
        var body = {"user_name":this.state.user_name,"last_name":event.target.last_name.value, "email": event.target.email.value, "first_name":event.target.first_name.value,"password":this.state.password,
        "roles":roles,"courses_as_student":this.state.courses_as_student,"courses_as_staff":this.state.courses_as_staff}
         fetch(window.location.origin + '/api/users/' + this.userNameFromReq , {method:'PUT', 
         body: JSON.stringify(body), headers: {'Authorization': 'Basic ' + btoa('username:password')}})
         .then((response) => {
          if (response.ok) {
            this.setState({alertSuccess: true})
          } else {
            this.setState({alertFailure: true})
          }
          return response.json()
         })
         this.props.history.go(0)
    }


     componentDidMount() {
        this.userNameFromReq = this.props.match.params.id
        var state_cookie = getCookie("submit-last-server-state");
        this.username = JSON.parse(state_cookie).user_name;
        this.userURL = window.location.origin + '/api/users/' + this.userNameFromReq
        fetch(this.userURL, {method:'GET', 
        headers: {'Authorization': 'Basic ' + btoa('username:password')}})
        .then((response) => {
          var jsonResponse = response.json()
            if (response.status === 403){
              this.props.history.push("/unauthorized");
              this.props.history.go(0);
            } else if (response.status === 404){
              this.props.history.push("/not-found");
              this.props.history.go(0);
            }
            return jsonResponse
        })
        .then (data => {
            this.setState(data);
        });
        this.checkAdmin()
        this.props.navbar(true)
    }

    handleCloseModal(){
      this.setState({showCoursesManagmentModal: false})
    }

    handleShowModal(){
      this.setState({showCoursesManagmentModal: true})
    }

    checkAdmin() {
      if (parseResp(JSON.stringify(this.state.roles.elements)) === "Admin") {
        return true
      }
      return false
    }

    courseOnClick = (course) => {
      this.props.history.push("/courses/" + course.replaceAll(":","/"))
    }

    render() {
        return (
          <Fragment>
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
<br></br>
{checkAdminCookie() ? (parseResp(JSON.stringify(this.state.roles.elements)) !== "None" && <AdminUserRoles role={ parseResp(JSON.stringify(this.state.roles.elements))}></AdminUserRoles>) : <UserRoles></UserRoles>}
  </Form.Row>
  <br></br>

  <Button id="submitUserFormBut" variant="primary" type="submit">
    Submit
  </Button>
  <Button id="getCoursesManagment" variant="primary"  onClick={this.handleShowModal}>Courses managment</Button>
  {this.state.alertSuccess && <AlertSuccess></AlertSuccess>}
  {this.state.alertFailure && <AlertFailed></AlertFailed>}
</Form>

<DavidModal id="coursesManagmentModal" open={this.state.showCoursesManagmentModal} center onClose={this.handleCloseModal}>
<div className="adminPanel">
{(this.state.courses_as_student.elements !== {} ||  this.state.courses_as_staff.elements !== {}) && <UserCourses onSubmitModal={this.handleShowModal} id="usercoursestables" checkAdminCookie={this.checkAdminCookie} courseOnClick={this.courseOnClick} user_name={this.state.user_name} studentCourses={this.state.courses_as_student.elements} staffCourses={this.state.courses_as_staff.elements} history={this.props.history}></UserCourses>}
{checkAdminCookie() && <AddUserToCourseAsStudentModal  history={this.props.history} onSubmitModal={this.handleShowModal} courses_as_staff={this.state.courses_as_staff} courses_as_student={this.state.courses_as_student} user_name={this.state.user_name} userURL={window.location.origin + '/api/users/' + this.state.user_name}></AddUserToCourseAsStudentModal>}
<br></br>
{checkAdminCookie() && <AddUserToCourseAsStaffModal history={this.props.history} onSubmitModal={this.handleShowModal} courses_as_staff={this.state.courses_as_staff} courses_as_student={this.state.courses_as_student} user_name={this.state.user_name} userURL={window.location.origin + '/api/users/' + this.state.user_name}></AddUserToCourseAsStaffModal>}
</div>
</DavidModal>


</Fragment>

)}
}
 


function parseResp(str){ 
  if (str.includes("admin")){
    return "Admin"
  } else if (str.includes("secretary")) {
    return "Secretary"
  } else if (str.includes("std_user")){
    return "User"
  } else if (str.includes("agent")){
    return "Agent"
  }
  var toRet = str.replaceAll("{","").replaceAll("}","").replaceAll(",", " ").replaceAll(":"," ").replaceAll("\"","")
  if (toRet === ""){
    return "None"
  }
}

function checkAdminCookie(){
  let roles;
  let state_cookie = getCookie("submit-last-server-state");
  if (state_cookie !== undefined){
    roles = JSON.parse(state_cookie).roles;
  } else {
    return roles = [];
  }
  return parseResp(JSON.stringify(roles)) === "Admin"
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
      label={`Standard user`}
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
    label={`Standard user`}
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
    const [number,year] = course.split(":");
    studentCoursesToRet.push({number: number, year: year})
  })
 
  as_staff.forEach((course) => {
    const [number,year] = course.split(":");
    staffCoursesToRet.push({number: number, year: year})
  })
  return [studentCoursesToRet,staffCoursesToRet]
}

class UserCourses extends Component {
  constructor(props){
    super(props);
    this.state = {
      coursesSelectedToDelete:[], staffCoursesSelectedToDelete:[], studentCoursesList:[], staffCoursesList:[], disableAsStudentDelete: true, disableAsStaffDelete: true,
    }
  }
  columns = 
  [
    {
      dataField: 'number',
      text: 'Course number'
    },
    {
    dataField: 'year',
    text: 'Course year'
  }];

 componentDidMount() {
  this.setState({studentCoursesList:this.props.studentCourses}, () => {
  })
  this.setState({staffCoursesList:Object.keys(this.props.staffCourses)})
 }

  onSelectStudentTable = (props) => {
    var arr=[]
    var index = this.state.coursesSelectedToDelete.indexOf(JSON.stringify({year: props.year, number: props.number}));
    if (index !== -1) {
      arr = removeItemOnce(this.state.coursesSelectedToDelete, JSON.stringify({year: props.year, number: props.number}))
      this.setState({coursesSelectedToDelete: arr}, () => {
      });
    } else {
      arr = [...this.state.coursesSelectedToDelete, JSON.stringify({year: props.year, number: props.number})]
      arr.forEach((course) => {
        course = course.replaceAll("\\","");
      })
      this.setState({coursesSelectedToDelete:arr}, () => {
        if (this.state.coursesSelectedToDelete.length > 0){
          this.setState({disableAsStudentDelete: false})
        }
      })
    }
  } 

  onSelectStaffTable = (props) => {
    var arr=[]
    var index = this.state.staffCoursesSelectedToDelete.indexOf(JSON.stringify({year: props.year, number: props.number}));
    if (index !== -1) {
      arr = removeItemOnce(this.state.staffCoursesSelectedToDelete, JSON.stringify({year: props.year, number: props.number}))
      this.setState({staffCoursesSelectedToDelete: arr});
    } else {
      arr = [...this.state.staffCoursesSelectedToDelete, JSON.stringify({year: props.year, number: props.number})]
      arr.forEach((course) => {
        course = course.replaceAll("\\","");
      })
      this.setState({staffCoursesSelectedToDelete:arr}, () => {
        if (this.state.staffCoursesSelectedToDelete.length > 0){
          this.setState({disableAsStaffDelete: false})
        }
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
    var body = {username: this.props.user_name, courses_as_student:{elements:this.props.studentCourses}}
    this.state.coursesSelectedToDelete.forEach((course) => {
      course = JSON.parse(course)
      var toRemove = course.number + ":" + course.year
      if (Object.keys(body.courses_as_student.elements).includes(toRemove)){
        delete body.courses_as_student.elements[toRemove]
      }
    })

    fetch(window.location.origin + '/api/users/' + this.props.user_name , {method:'PUT', body: JSON.stringify(body),
    headers: {'Authorization': 'Basic ' + btoa('username:password')}})
    .then((response) => {
    if (!response.ok){
        alert("balagan")
    }
    return response.json()
    });
    this.props.onSubmitModal();

}

deleteSelectedCoursesAsStaff = () => {
  var body = {username: this.props.user_name, courses_as_staff:{elements:this.props.staffCourses}}
  this.state.staffCoursesSelectedToDelete.forEach((course) => {
    course = JSON.parse(course)
    var toRemove = course.number + ":" + course.year
    if (Object.keys(body.courses_as_staff.elements).includes(toRemove)){
      delete body.courses_as_staff.elements[toRemove]
    }
  })

  fetch(window.location.origin + '/api/users/' + this.props.user_name , {method:'PUT', body: JSON.stringify(body),
  headers: {'Authorization': 'Basic ' + btoa('username:password')}})
  .then((response) => {
  if (!response.ok){
      alert("balagan")
  }
  return response.json()
  });
  this.props.onSubmitModal();

}


  selectRowStudent = {
    mode: "radio",
    clickToSelect: false,
    classes: "selection-row",
    onSelect: this.onSelectStudentTable,
    hideSelectAll: true
  };

  selectRowStaff = {
    mode: "radio",
    clickToSelect: false,
    classes: "selection-row",
    onSelect: this.onSelectStaffTable,
    hideSelectAll: true
  };


render(){
  console.log("brfa",this.state.coursesSelectedToDelete);
  var studentCoursesList = Object.keys(this.props.studentCourses)
  var staffCoursesList = Object.keys(this.props.staffCourses)
  const [as_student,as_staff] = createTableWithCourses(studentCoursesList,staffCoursesList)
  return (
    <div className="tables">
    <Fragment>
    {checkAdminCookie() && <h5>Course As Student:</h5>}
    {checkAdminCookie() &&  studentCoursesList.length === 0 && <AlertNoCourses></AlertNoCourses>}
    {checkAdminCookie() && <br></br>}
    {checkAdminCookie() && studentCoursesList.length !== 0 &&  <Button disabled={this.state.disableAsStudentDelete} variant="primary" id= "deleteCourseButInUser" onClick={this.deleteSelectedCoursesAsStudent}>
          Delete
      </Button>}
    {checkAdminCookie() && studentCoursesList.length !== 0 && <BootstrapTable id= "userCoursesTable" selectRow={this.selectRowStudent} hover keyField='number' data={as_student} columns={ this.columns } pagination={ paginationFactory(PagingOptions) } />}
    {checkAdminCookie() && <h5>Course As Staff:</h5>}
    {checkAdminCookie() &&  staffCoursesList.length === 0 && <AlertNoCourses></AlertNoCourses>}
    {checkAdminCookie() && <br></br>}
    {checkAdminCookie() && staffCoursesList.length !== 0 && <Button disabled={this.state.disableAsStaffDelete} variant="primary" id= "deleteCourseButInStaff" onClick={this.deleteSelectedCoursesAsStaff}>

          Delete
      </Button>}
    {checkAdminCookie() && staffCoursesList.length !== 0 && <BootstrapTable id= "staffCoursesTable" selectRow={this.selectRowStaff} hover keyField='number' data={as_staff} columns={ this.columns }  pagination={ paginationFactory(PagingOptions) }/>}
    {!checkAdminCookie() && <h5>Course As Student:</h5>}
    {!checkAdminCookie() &&  studentCoursesList.length === 0 && <AlertNoCourses></AlertNoCourses>}
    {!checkAdminCookie() && <br></br>}
    {!checkAdminCookie() && studentCoursesList.length !== 0 && <BootstrapTable id= "userCoursesTable"  hover keyField='number' data={as_student} columns={ this.columns } pagination={ paginationFactory(PagingOptions) } />}
    {!checkAdminCookie() && <h5>Course As Staff:</h5>}
    {!checkAdminCookie() &&  staffCoursesList.length === 0 && <AlertNoCourses></AlertNoCourses>}
    {!checkAdminCookie() && <br></br>}
    {!checkAdminCookie() && staffCoursesList.length !== 0 && <BootstrapTable id= "staffCoursesTable"  hover keyField='number' data={as_staff} columns={ this.columns }  pagination={ paginationFactory(PagingOptions) }/>}
    
     </Fragment>
</div>
  )
}


}

const AlertNoCourses = () => <div class="alert alert-info" role="alert">No Courses Yet...</div>;

const PagingOptions = {
  page: 1,
  sizePerPage: 3,
  nextPageText: '>',
  prePageText: '<',
  hideSizePerPage: true, // hide the size per page dropdown
  showTotal: false,
};

const AlertSuccess = () => {
    return (
      <div id="alertSuccessUser" class="alert alert-success" role="alert">
      User data updated successfully!
      </div>
    )
}

  const AlertFailed = () => {
    return (
     <div id="alertFailedUser" class="alert alert-danger" role="alert">
       Failed to update user data! try again!
     </div>
    )
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
          <Modal.Title>Choose course</Modal.Title>
        <Modal.Body>
<GetCoursesList showModal={props.onSubmitModal} role={"student"} history={props.history} courses_as_staff={props.courses_as_staff} courses_as_student={props.courses_as_student} close={handleClose} userURL={props.userURL} user_name={props.user_name}></GetCoursesList>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleClose}>
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
          <Modal.Title>Choose course</Modal.Title>
        <Modal.Body>
<GetCoursesList showModal={props.onSubmitModal} role={"staff"} history={props.history} courses_as_student={props.courses_as_student} courses_as_staff={props.courses_as_staff} close={handleClose} userURL={props.userURL} user_name={props.user_name}></GetCoursesList>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleClose}>
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
    this.checkCourses=this.checkCourses.bind(this);
  }

  async componentDidMount(){
    var coursesURL = window.location.origin + "/api/courses/"
    await fetch(coursesURL, {method:'GET', 
    headers: {'Authorization': 'Basic ' + btoa('username:password')}})
    .then((response) => {
        return response.json()
    })
    .then (data => {
        this.setState({elements : data}, () => {
          if (this.props.role === "staff"){
            var coursesStaff = parseCourses(this.state.elements.elements);
            coursesStaff = this.checkCourses(true,coursesStaff);
            this.setState({coursesListAsStaff: coursesStaff}, () => {
              this.parseAnswerCoursesAsStaff();
            })
          } else {
            var coursesStudent = parseCourses(this.state.elements.elements);
            coursesStudent = this.checkCourses(false,coursesStudent);
            this.setState({coursesList:coursesStudent}, () => {
              this.parseAnswerCoursesAsStudent();
            })
          }
        })
    });

  }


  checkCourses = (isStaff, courses) => {
    var keys = [];
    if (isStaff){
      keys = Object.keys(this.props.courses_as_student.elements);
    } else {
      keys = Object.keys(this.props.courses_as_staff.elements);
    }
    var coursesToRet = courses;
    keys.forEach((key) => {
      var [number,year] = key.split(":");
      number = number.trim()
      year = year.trim()
      courses.forEach((course) => {
        var [courseNumber,courseYear] = course.split("/");
        courseNumber = courseNumber.trim();
        courseYear = courseYear.trim();
        if (number === courseNumber && year === courseYear){
          coursesToRet = removeItemOnce(courses,course);
        }
      })
    })
    return coursesToRet;
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
    fetch(this.props.userURL, {method:'PUT', 
     body: (JSON.stringify(body)),headers: {'Authorization': 'Basic ' + btoa('username:password')}})
    .then((response) => {
        return response.json()
    })
    this.props.close();
    this.props.showModal();
    this.props.history.go(0);

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
    fetch(this.props.userURL, {method:'PUT', 
     body: (JSON.stringify(body)),headers: {'Authorization': 'Basic ' + btoa('username:password')}})
    .then((response) => {
        return response.json()
    })
     this.props.close();
     this.props.showModal();
     this.props.history.go(0);

  }


  parseAnswerCoursesAsStudent(){
    var checkedCoursesToRet = []
    if (this.props.courses_as_student !== undefined){
      var coursesFromProps= Object.keys(this.props.courses_as_student.elements);
    } else {
      coursesFromProps=[]
    }
    
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
    this.setState({checkedStaff: toRet})
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
    if (this.props.role === "staff"){
      options = this.state.coursesListAsStaff.filter(n => !this.state.coursesList.includes(n));
      checked = this.state.checkedStaff;
      applyFunc=this.updateCoursesAsStaff
    } else {
      options = this.state.coursesList.filter(n => !this.state.coursesListAsStaff.includes(n));
      checked = this.state.checked;
      applyFunc=this.updateCoursesAsStudent;
    }
    var finalOptions = []
    options.forEach((option) => {
      option = {name: option, id: option}
      finalOptions.push(option)
    })
    return (
<Fragment>
  {(options === null || options.length === 0 || checked === null) &&<AlertNoCoursesToAdd></AlertNoCoursesToAdd>}
{options !== null && options.length !== 0 && checked !== null && <Multiselect
      options={finalOptions}
      onRemove={this.onRemove}
      onSelect={this.onSelect}
      selectedValues={checked}
      disablePreSelectedValues
      displayValue="name" // Property name to display in the dropdown options

    />}
      <Button variant="primary" id="submitAddCourse" onClick={applyFunc}>
      Save Changes
    </Button>
</Fragment>
    )
  }

}


const AlertNoCoursesToAdd = () => <div class="alert alert-info" role="alert">No courses to add...</div>;


const parseCourses = (coursesList) => {
  var courses=[]
  if (coursesList === undefined || coursesList === null){
    return []
  }
  for (let i = 0; i < coursesList.length; i++) {
   courses[i] = coursesList[i].number + " / " + coursesList[i].year + " / " + coursesList[i].name
 }
 return courses
}

  export default withRouter(User);

