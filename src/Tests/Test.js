import {Component, Fragment} from "react";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import {parseTestState} from "../Utils/utils"
import "./Test.css"
import ListGroup from "react-bootstrap/ListGroup";
export default class Test extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
        };
        this.loaded = false;
        this.isLoaded = this.isLoaded.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
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


    render() {
        console.log(this.state)
        return (
        <Fragment>
            <Form id="singleTestForm">
            <Form.Row>
                <div class="input-group">
                    <Col md style={{margin: 5}}>
                        <Form.Group className="mb-3" controlId="assignment_def">
                            <Form.Label>Assignment</Form.Label>
                            <Form.Control disabled type="text" disaled value={this.state.assignment_def !== undefined ? this.state.assignment_def.replaceAll(":","/") : ""} />
                        </Form.Group>
                        <Form.Group disabled className="mb-3" controlId="name">
                            <Form.Label>Name</Form.Label>
                            <Form.Control type="text" disaled value={this.state.name} />
                        </Form.Group>
                        <Form.Group disabled className="mb-3" controlId="os_type">
                            <Form.Label>OS</Form.Label>
                            <Form.Control disabled type="text" disaled value={this.state.os_type} />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="timeout">
                            <Form.Label>Timeout</Form.Label>
                            <Form.Control disabled type="text" disaled value={this.state.timeout} />
                        </Form.Group>
                    </Col>
                    <Col md style={{margin: 5}}>
                        <Form.Group className="mb-3" controlId="state">
                            <Form.Label>State</Form.Label>
                            <Form.Control disabled type="text" disaled value={parseTestState(this.state.state)} />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="architecture">
                            <Form.Label>Architecture</Form.Label>
                            <Form.Control disabled type="text" disaled value={this.state.architecture} />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="created_on">
                            <Form.Label>Creation date</Form.Label>
                            <Form.Control disabled type="text" disaled value={new Date(this.state.created_on)} />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="created_by">
                            <Form.Label>Created by</Form.Label>
                            <Form.Control disabled type="text" disaled value={this.state.created_by} />
                        </Form.Group>
                    </Col>
                    <Col md style={{margin: 5}}>
                        <Form.Group className="mb-3" controlId="command">
                            <Form.Label>Command</Form.Label>
                            <Form.Control disabled type="text" disaled value={this.state.command} />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="runs_on">
                            <Form.Label>Runs on</Form.Label>
                            <Form.Control disabled type="text" disaled value={this.state.runs_on} />
                        </Form.Group>
                    </Col>

                </div>
            </Form.Row>
            </Form>
        </Fragment>
        )
    }

}

