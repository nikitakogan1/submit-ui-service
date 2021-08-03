import {Component, Fragment} from "react";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import FormFiles from "../FormFiles/FormFiles.js"
import {getLoggedInUserName} from "../Utils/session";
import {doesUserHaveRole,isStaffCourse} from "../Utils/session.js";
import { Modal } from 'react-responsive-modal';
import Button from "react-bootstrap/Button";
import "./Assignment.css"

export default class Assignment extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            files: {elements:{}},
        };
        this.loaded = false;
        this.isLoaded = this.isLoaded.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
    }

    
    parseStatus= (number) => {
        if (number === 0){
          return "Assigned"
        } else if (number === 1) {
          return "Submitted"
        } else {
          return "Graded"
        }
      }

    componentDidMount() {
        this.props.navbar(true);
        fetch(window.location.origin + "/api" + window.location.pathname).then((response) => {
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

    parseGrade(grade){
        if (this.state.state === 0 && this.state.grade === 0){
            return "-"
        }
        return grade
    }

    updateGrade = (event) => {
        event.preventDefault(event);
        console.log(event.target.grade.value)
        var body = {assignment_def: this.state.assignment_def, grade: parseInt(event.target.grade.value), files: this.state.files, state: this.state.state}
        console.log(body)
        fetch(window.location.origin + "/api" + window.location.pathname + "/" + getLoggedInUserName(), {method:'PUT', 
        body: JSON.stringify(body)})
        .then((response) => {
        if (!response.ok){
            alert("Updating grade failed")
        }
        });
        this.props.history.go(0);
    }

    render() {
        if (this.state.assignment_def !== undefined){
            var [number,year,_] = this.state.assignment_def.split(":")
        }
        let allowFilesModification = doesUserHaveRole("std_user") || doesUserHaveRole("admin")
        let allowActions = doesUserHaveRole("admin") || isStaffCourse(number + year)
        return (
        <Fragment>
            <Form id= "assignment_instance_form" onSubmit={this.updateGrade}>
            <Form.Row>
            <div class="input-group">
                <Col md style={{margin: 5}}>
                    <Form.Group as={Col} controlId="assignment_def">
                        <Form.Label>Assignment:</Form.Label>
                        <Form.Control placeholder="Assignment" disabled value={this.state.assignment_def !== undefined ? this.state.assignment_def.replaceAll(":","/") : ""} />
                    </Form.Group>
                </Col>
                <Col md style={{margin: 5}}>
                    <Form.Group as={Col} controlId="due_by">
                        <Form.Label>Due by:</Form.Label>
                        <Form.Control placeholder="Due by" disabled value={new Date(this.state.due_by).toString()} />
                    </Form.Group>
                </Col>
                <Col md style={{margin: 5}}>
                    <Form.Group as={Col} controlId="state">
                        <Form.Label>State:</Form.Label>
                        <Form.Control placeholder="State" disabled value={this.parseStatus(this.state.state)} />
                    </Form.Group>
                </Col>
                <Col md style={{margin: 5}}>
                    <Form.Group as={Col} controlId="grade">
                        <Form.Label>Grade:</Form.Label>
                        <Form.Control placeholder="Grade" defaultValue={this.parseGrade(this.state.grade)} />
                    </Form.Group>
                </Col>
            </div>
            <br></br>
            </Form.Row>
                {<Form.Row>
                    <Col md style={{margin: 5}}>
                        <Form.Group>
                            <Form.Label>Files:</Form.Label>
                            <br></br>
                            {this.isLoaded() && this.state.files !== null && <FormFiles id="formFilesSubmitAssignment" allowModification={allowFilesModification} elementBucket="assignment_instances" elementKey={this.state.assignment_def.replaceAll(":","/") + "/" + getLoggedInUserName()} files={this.state.files} history={this.props.history}/>}
                            <br></br>
                            <br></br>
                            <br></br>
                            <br></br>
                {allowActions && <Form.Row>
                <div class="input-group">
                    <Col md style={{margin: 5}}>
                        <Form.Label>Actions:</Form.Label>
                    </Col>
                    <Col md style={{margin: 5}}>
                        <Button type="submit" id="updateUserGrade" variant="primary" style={{margin: 5}}>Update</Button>
                    </Col>
                </div>
            </Form.Row>}
                        </Form.Group>
                    </Col>
                </Form.Row>}
            </Form>
        </Fragment>
        )
    }

}
