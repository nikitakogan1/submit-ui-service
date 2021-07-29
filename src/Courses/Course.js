import {Component, Fragment} from "react";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import FormFiles from "../FormFiles/FormFiles.js"
import {doesUserHaveRole, isStaffCourse} from "../Utils/session.js";

export default class Course extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            number: 0,
            year: 0,
            name: "",
            files: {elements:{}}
        };
        this.loaded = false;
        this.isLoaded = this.isLoaded.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
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

    render() {
        let allowFilesModification = doesUserHaveRole("admin") || doesUserHaveRole("secretary") || isStaffCourse(this.state.number.toString() + ":" + this.state.year.toString())
        return (
            <Fragment>
                <Form.Row>
                    <Form.Group as={Col} controlId="number">
                        <Form.Label>Number:</Form.Label>
                        <Form.Control placeholder="Number" disabled value={this.state.number} />
                    </Form.Group>
                </Form.Row>
                <Form.Row>
                    <Form.Group as={Col} controlId="year">
                        <Form.Label>Year:</Form.Label>
                        <Form.Control placeholder="Year" disabled value={this.state.year} />
                    </Form.Group>
                </Form.Row>
                <Form.Row>
                    <Form.Group as={Col} controlId="name">
                        <Form.Label>Name:</Form.Label>
                        <Form.Control placeholder="Name" disabled value={this.state.name} />
                    </Form.Group>
                </Form.Row>
                <Form.Row>
                    <Form.Group>
                        <Form.Label>Files:</Form.Label>
                        {this.isLoaded() && <FormFiles allowModification={allowFilesModification} elementBucket="courses" elementKey={this.state.number.toString() + "/" + this.state.year.toString()} files={this.state.files} history={this.props.history}/>}
                    </Form.Group>
                </Form.Row>
            </Fragment>
        )
    }

}
