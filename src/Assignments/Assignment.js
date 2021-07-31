import {Component, Fragment} from "react";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import FormFiles from "../FormFiles/FormFiles.js"
import {getLoggedInUserName} from "../Utils/session";
import {doesUserHaveRole} from "../Utils/session.js";

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
        console.log(window.location.origin + "/api" + window.location.pathname + "/" + getLoggedInUserName()) 
        fetch(window.location.origin + "/api" + window.location.pathname + "/" + getLoggedInUserName()).then((response) => {
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
        if (this.state.state === 0){
            return "-"
        }
        return grade
    }

    render() {
        let allowFilesModification = doesUserHaveRole("std_user") || doesUserHaveRole("admin")
        return (
             <Fragment>
                <Form.Row>
                    <Form.Group as={Col} controlId="assignment_def">
                        <Form.Label>Assignment:</Form.Label>
                        <Form.Control placeholder="Assignment" disabled value={this.state.assignment_def !== undefined ? this.state.assignment_def.replaceAll(":","/") : ""} />
                    </Form.Group>
                </Form.Row>
                <Form.Row>
                    <Form.Group as={Col} controlId="due_by">
                        <Form.Label>Due by:</Form.Label>
                        <Form.Control placeholder="Due by" disabled value={new Date(this.state.due_by).toString()} />
                    </Form.Group>
                </Form.Row>
                <Form.Row>
                    <Form.Group as={Col} controlId="state">
                        <Form.Label>State:</Form.Label>
                        <Form.Control placeholder="State" disabled value={this.parseStatus(this.state.state)} />
                    </Form.Group>
                </Form.Row>
                <Form.Row>
                    <Form.Group as={Col} controlId="grade">
                        <Form.Label>Grade:</Form.Label>
                        <Form.Control placeholder="Grade" disabled value={this.parseGrade(this.state.grade)} />
                    </Form.Group>
                </Form.Row>
                <Form.Row>
                    <Form.Group>
                        <Form.Label>Files:</Form.Label>
                        {this.isLoaded() && <FormFiles allowModification={allowFilesModification} elementBucket="assignment_instances" elementKey={this.state.assignment_def.replaceAll(":","/") + "/" + getLoggedInUserName()} files={this.state.files} history={this.props.history}/>}
                    </Form.Group>
                </Form.Row>
            </Fragment>
        )
    }

}
