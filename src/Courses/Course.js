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
        this.loaded = false;
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
                    <CourseAssignmentDefs courseNumber={this.state.number.toString()} courseYear={this.state.year.toString()}/>
                </Modal>
                <Modal open={this.state.showAppealsModal} center onClose={() => {this.setState({showAppealsModal: false})}}>
                    Appeals Modal
                </Modal>
            </Fragment>
        )
    }

}

const AlertNoAssignments = () => <div class="alert alert-info" role="alert">No Assignments Yet...</div>;

class CourseAssignmentDefs extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            left_to_process: false,
            limit: 5,
            after_id: 0,
            elements: null
        }
        this.courseNumber = props.courseNumber;
        this.courseYear = props.courseYear;
        this.componentDidMount = this.componentDidMount.bind(this);
        this.previousPage = this.previousPage.bind(this);
        this.nextPage = this.nextPage.bind(this);
        this.goToBackEnd = this.goToBackEnd.bind(this);
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
        .then (data => {
          this.setState({elements:data.elements}, () => this.setState({isLoaded: true}));
        });
    }

    componentDidMount() {
        this.goToBackEnd();
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
            {this.isLoaded() && this.state.elements !== null && <div><br></br><BootstrapTable hover keyField='name' data={ this.state.elements } columns={ this.columns } /></div>}
            {this.isLoaded() && this.state.elements === null && <div><br></br><AlertNoAssignments/></div>}
            {this.isLoaded() && this.state.after_id > 0 && <Button variant="primary" onClick={this.previousPage}>Previous</Button>}
            {this.isLoaded() && this.state.left_to_process && <Button variant="primary" onClick={this.previousPage}>Next</Button>}
        </div>
    }

}
