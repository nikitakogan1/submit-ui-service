import {Component, Fragment} from "react";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import FormFiles from "../FormFiles/FormFiles.js"
import {doesUserHaveRole, isStaffCourse} from "../Utils/session.js";
import Button from "react-bootstrap/Button";
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import BootstrapTable from 'react-bootstrap-table-next';

export default class Course extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            number: 0,
            year: 0,
            name: "",
            files: {elements:{}},
            showAssignmentsModal: false,
            showAppealsModal: false
        };
        this.isLoaded = this.isLoaded.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.courseAssignments = this.courseAssignments.bind(this);
        this.courseAppeals = this.courseAppeals.bind(this);
    }

    componentDidMount() {
        this.props.navbar(true);
        fetch(window.location.origin + "/api/" + window.location.pathname).then((response) => {
            if (response.status === 403) {
                this.props.history.push("/unauthorized");
                this.props.history.go(0);
            } else if (response.status === 404) {
                this.props.history.push("/not-found");
                this.props.history.go(0);
            } else if (response.status !== 200) {
                this.props.history.push("/internal-error");
                this.props.history.go(0);
            }
            return response.json();
        }).then((respJson) => this.setState(respJson, () => this.setState({isLoaded: true})));
    }

    isLoaded() {
        return this.state.isLoaded;
    }

    courseAssignments() {
        this.setState({showAssignmentsModal: true})
    }

    courseAppeals() {
        this.setState({showAppealsModal: true})
    }

    render() {
        let courseKey = this.state.number.toString() + ":" + this.state.year.toString();
        let allowFilesModification = doesUserHaveRole("admin") || doesUserHaveRole("secretary") || isStaffCourse(courseKey)
        let allowActions = doesUserHaveRole("admin") || isStaffCourse(courseKey)
        return (
            <Fragment>
                <Form.Row>
                    <div class="input-group">
                        <Col md style={{margin: 5}}>
                            <Form.Group controlId="number">
                                <Form.Label>Number:</Form.Label>
                                <Form.Control disabled value={this.state.number}/>
                            </Form.Group>
                        </Col>
                        <Col md style={{margin: 5}}>
                            <Form.Group controlId="year">
                                <Form.Label>Year:</Form.Label>
                                <Form.Control disabled value={this.state.year}/>
                            </Form.Group>
                        </Col>
                        <Col md style={{margin: 5}}>
                            <Form.Group controlId="name">
                                <Form.Label>Name:</Form.Label>
                                <Form.Control disabled value={this.state.name}/>
                            </Form.Group>
                        </Col>
                    </div>
                </Form.Row>
                {allowActions && <Form.Row>
                    <div class="input-group">
                        <Col md style={{margin: 5}}>
                            <Form.Label>Actions:</Form.Label>
                        </Col>
                        <Col md style={{margin: 5}}>
                            <Button id="getCourseAssignmentsButton" variant="primary" style={{margin: 5}} onClick={this.courseAssignments}>Assignments</Button>
                        </Col>
                        <Col md style={{margin: 5}}>
                            <Button id="getCourseAppealsButton" variant="primary" style={{margin: 5}} onClick={this.courseAppeals}>Appeals</Button>
                        </Col>
                    </div>
                </Form.Row>}
                <Form.Row>
                    <Col md style={{margin: 5}}>
                        <Form.Group>
                            <Form.Label>Files:</Form.Label>
                            {this.isLoaded() && <FormFiles allowModification={allowFilesModification} elementBucket="courses" elementKey={this.state.number.toString() + "/" + this.state.year.toString()} files={this.state.files} history={this.props.history}/>}
                        </Form.Group>
                    </Col>
                </Form.Row>
                <Modal open={this.state.showAssignmentsModal} center onClose={() => {this.setState({showAssignmentsModal: false})}}>
                    <div style={{maxHeight: 400, maxWidth: 700}}><CourseAssignmentDefs history={this.props.history} courseNumber={this.state.number.toString()} courseYear={this.state.year.toString()}/><br></br></div>
                </Modal>
                <Modal open={this.state.showAppealsModal} center onClose={() => {this.setState({showAppealsModal: false})}}>
                    <div style={{maxHeight: 400, maxWidth: 700}}><CourseAppeals history={this.props.history} courseNumber={this.state.number.toString()} courseYear={this.state.year.toString()}/><br></br></div>
                </Modal>
            </Fragment>
        )
    }

}

const AlertNoAssignments = () => <div class="alert alert-info" role="alert">No Assignments Here...</div>;
const AlertNoAppeals = () => <div class="alert alert-info" role="alert">No Appeals Here...</div>;

class CourseAssignmentDefs extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            left_to_process: false,
            limit: 5,
            after_id: 0,
            elements: null,
            assignmentToDelete: null,
            showNewAssignmentModal: false
        }
        this.courseNumber = props.courseNumber;
        this.courseYear = props.courseYear;
        this.isLoaded = this.isLoaded.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.previousPage = this.previousPage.bind(this);
        this.nextPage = this.nextPage.bind(this);
        this.goToBackEnd = this.goToBackEnd.bind(this);
        this.deleteAssignment = this.deleteAssignment.bind(this);
        this.createAssignment = this.createAssignment.bind(this);
    }

    isLoaded() {
        return this.state.isLoaded;
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

    goToBackEnd() {
        var url = window.location.origin + '/api/assignment_definitions/?limit='+ this.state.limit
        if (this.state.after_id > 0) {
          url = url + "&after_id=" + this.state.after_id
        }
        fetch(url, {method:'GET', 
        headers: {'X-Submit-Course': this.courseNumber + ":" + this.courseYear}})
        .then((response) => {
          if (response.status !== 200){
            alert("error fetching assignment defintions for course. Status code is " + response.status)  
            this.props.history.push("/internal-error");
            this.props.history.go(0);
          }
          if (response.headers.has("X-Elements-Left-To-Process")){
              this.setState({left_to_process:true})
          } else {
              this.setState({left_to_process:false})
          }
          return response.json()
        })
        .then(data => {
          if (data.elements !== null) {
            for (let i = 0; i < data.elements.length; i++) {
            data.elements[i]["key"] = data.elements[i]["course"] + ":" + data.elements[i]["name"];
            } 
          }
          this.setState({elements:data.elements}, () => this.setState({isLoaded: true}));
        });
    }

    componentDidMount() {
        this.goToBackEnd();
    }

    onAssignmentSelectedForDeletion = (row, isSelect, rowIndex, e) => {
        this.setState({assignmentToDelete: row.name});
    }

    deleteAssignment() {
        fetch(window.location.origin + "/api/assignment_definitions/" + this.courseNumber + "/" + this.courseYear + "/" + this.state.assignmentToDelete,
        {method: "DELETE"}).then((resp) => {
            if (resp.status !== 200) {
                alert("error deleting assignment definition. Status code is " + resp.status);
            } else {
                alert("assignment defintion deleted successfully");
            }
            this.props.history.go(0);
        }).catch(err => alert(err));
    }

    createAssignment(event) {
        event.preventDefault(event);
        let dueBy;
        try {
            dueBy = new Date(event.target.due_by_date.value + "T" + event.target.due_by_time.value).toISOString();
        } catch(e) {
            alert("invalid date/time values");
            return;
        }
        fetch(window.location.origin + "/api/assignment_definitions/", {method: "POST", body:JSON.stringify({
            course: this.courseNumber + ":" + this.courseYear,
            due_by: dueBy,
            name: event.target.name.value
        })}).then((resp) => {
            if (resp.status !== 202) {
                alert("error creating assignment definition. Status code is " + resp.status);
            } else {
                alert("assignment definition created successfully");
            }
            this.props.history.go(0);
        })
    }

    selectAssignmentToDelete = {
        mode: "radio",
        clickToSelect: false,
        onSelect: this.onAssignmentSelectedForDeletion
    }

    columns = [{
        dataField: "name",
        text: "Name",
        formatter: (cell) => <a href={window.location.origin + "/assignment_definitions/" + this.courseNumber + "/" + this.courseYear + "/" + cell}>{cell}</a>
    },
    {
        dataField: "due_by",
        text: "Due By",
        formatter: (cell) => <h10>{new Date(cell).toString()}</h10>
    },
    {
        dataField: "state",
        text: "State",
        formatter: (cell) => {
            if (cell === 0) {
                return <h10>Draft</h10>
            } else if (cell === 1) {
                return <h10>Published</h10>
            }
            return <h10>Invalid</h10>
        }
    }]

    render() {
        return <div>
            <Modal open={this.state.showNewAssignmentModal} center onClose={() => {this.setState({showNewAssignmentModal: false})}}>
                <br></br>
                <div style={{width: 455, height: 275}}><Form onSubmit={this.createAssignment}>
                    <div class="input-group"><Form.Row>
                        <Form.Group style={{width: 280, margin: 5}} controlId="name">
                            <Form.Label>Name:</Form.Label>
                            <Form.Control placeholder="Enter assignment name"/>
                        </Form.Group>
                    </Form.Row>
                    <Form.Row>
                        <Form.Group style={{width: 280, margin: 5}} controlId="due_by_date">
                            <Form.Label>Due by date:</Form.Label>
                            <Form.Control type="date"/>
                        </Form.Group>
                        <Form.Group style={{width: 280, margin: 5}} controlId="due_by_time">
                            <Form.Label>Due by time:</Form.Label>
                            <Form.Control type="time"/>
                        </Form.Group>
                    </Form.Row>
                    <Button style={{margin: 5}} variant="primary" type="submit">Submit</Button></div>
                </Form></div>
            </Modal>
            {this.isLoaded() && this.state.elements !== null && <div><br></br><BootstrapTable hover keyField="key" data={ this.state.elements } columns={ this.columns } selectRow={this.selectAssignmentToDelete}/></div>}
            {this.isLoaded() && this.state.elements === null && <div><br></br><AlertNoAssignments/></div>}
            <br></br>
            {this.isLoaded() && <div class="input-group">
                    {this.state.after_id > 0 && <Button variant="primary" onClick={this.previousPage} style={{position: "absolute", left: 0}}>Previous</Button>}
                    {this.state.left_to_process && <Button variant="primary" onClick={this.nextPage} style={{position: "absolute", right: 0}}>Next</Button>}
                </div>}
            <br></br><br></br> 
            {this.isLoaded() && <div class="input-group">
                {this.state.elements !== null && <Button disabled={this.state.assignmentToDelete === null} style={{position: "absolute", left: 0}} onClick={this.deleteAssignment}>Delete</Button>}
                <Button style={{position: "absolute", right: 0}} onClick={() => {this.setState({showNewAssignmentModal: true})}}>New</Button>
            </div>}
        </div>
    }

}

class CourseAppeals extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            left_to_process: false,
            limit: 5,
            after_id: 0,
            elements: null,
        };
        this.courseNumber = props.courseNumber;
        this.courseYear = props.courseYear;
        this.isLoaded = this.isLoaded.bind(this);
        this.goToBackEnd = this.goToBackEnd.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.previousPage = this.previousPage.bind(this);
        this.nextPage = this.nextPage.bind(this);
    }

    componentDidMount() {
        this.goToBackEnd();
    }

    isLoaded() {
        return this.state.isLoaded;
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

    goToBackEnd() {
        var url = window.location.origin + '/api/appeals/?limit='+ this.state.limit
        if (this.state.after_id > 0) {
          url = url + "&after_id=" + this.state.after_id
        }
        fetch(url, {method:'GET', 
        headers: {'X-Submit-Course': this.courseNumber + ":" + this.courseYear}})
        .then((response) => {
          if (response.status !== 200){
            alert("error fetching assignment defintions for course. Status code is " + response.status)  
            this.props.history.push("/internal-error");
            this.props.history.go(0);
          }
          if (response.headers.has("X-Elements-Left-To-Process")){
              this.setState({left_to_process:true})
          } else {
              this.setState({left_to_process:false})
          }
          return response.json()
        })
        .then(data => {
          if (data.elements !== null) {
            for (let i = 0; i < data.elements.length; i++) {
                let splitted = data.elements[i].assignment_instance.split(":");
                if (splitted.length !== 4) {
                    alert("invalid appeal key '" + data.elements[i].assignment_instance + "' returned from backend");
                    this.props.history.push("/internal-error");
                    this.props.history.go(0);
                    return null;
                }
                data.elements[i]["assignment_def"] = splitted[2];
                data.elements[i]["user_name"] = splitted[3];
            } 
          }
          this.setState({elements:data.elements}, () => this.setState({isLoaded: true}));
        });
    }

    columns = [{
        dataField: "user_name",
        text: "User",
        formatter: (cell, row) => <a href={window.location.origin + "/appeals/" + this.courseNumber + "/" + this.courseYear + "/" + row.assignment_def + "/" + cell}>{cell}</a>
    },{
        dataField: "assignment_def",
        text: "Assignment",
        formatter: (cell) => <a href={window.location.origin + "/assignment_definitions/" + this.courseNumber + "/" + this.courseYear + "/" + cell}>{cell}</a>
    },{
        dataField: "state",
        text: "State",
        formatter: (cell) => {
            if (cell === 0) {
                return <h10>Open</h10>
            } else if (cell === 1) {
                return <h10>Closed</h10>
            }
            return <h10>Invalid</h10>
        }
    }]

    render() {
        return <div>
            {this.isLoaded() && this.state.elements !== null && <div><br></br><BootstrapTable hover keyField="assignment_instance" data={ this.state.elements } columns={ this.columns }/></div>}
            {this.isLoaded() && this.state.elements === null && <div><br></br><AlertNoAppeals/></div>}
            <br></br>
            {this.isLoaded() && <div class="input-group">
                    {this.state.after_id > 0 && <Button variant="primary" onClick={this.previousPage} style={{position: "absolute", left: 0}}>Previous</Button>}
                    {this.state.left_to_process && <Button variant="primary" onClick={this.nextPage} style={{position: "absolute", right: 0}}>Next</Button>}
                </div>}
            <br></br><br></br> 
        </div>
    }

}
