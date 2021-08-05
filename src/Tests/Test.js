import {Component} from "react";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import { doesUserHaveRole, getLoggedInUserName, isStaffCourse } from "../Utils/session";
import Button from "react-bootstrap/Button";
import FormFiles from "../FormFiles/FormFiles.js";
import FormMessages from "../FormMessages/FormMessages";

export default class Test extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            courseNumber: "",
            courseYear: "",
            assName: "",
            name: "",
            command: "",
            state: 0,
            state_str: "",
            files: {elements:{}},
            runs_on: 0,
            runs_on_str: "",
            os_type: "",
            architecture: "",
            timeout: 0,
            message_box: "",
            created_by: "",
        };
        this.isLoaded = this.isLoaded.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.updateTestState = this.updateTestState.bind(this);
        this.setRunsOn = this.setRunsOn.bind(this);
        this.update = this.update.bind(this);
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
        }).then((respJson) => {
            let splitted = respJson.assignment_def.split(":");
            if (splitted.length !== 3) {
                alert("invalid assignment definition key returned from backend");
                this.props.history.push("/internal-error");
                this.props.history.go(0);
            }
            respJson["courseNumber"] = splitted[0];
            respJson["courseYear"] = splitted[1];
            respJson["assName"] = splitted[2];
            if (respJson.state === 0) {
                respJson["state_str"] = "Draft";
            } else if (respJson.state === 1) {
                respJson["state_str"] = "In Review";
            } else if (respJson.state === 2) {
                respJson["state_str"] = "Published";
            } else {
                alert("invalid state returned from backend");
                this.props.history.push("/internal-error");
                this.props.history.go(0);
            }
            if (respJson.runs_on === 0) {
                respJson["runs_on_str"] = "Submit";
            } else if (respJson.runs_on === 1) {
                respJson["runs_on_str"] = "Demand";
            } else {
                alert("invalid runs_on value returned from backend");
                this.props.history.push("/internal-error");
                this.props.history.go(0);
            }
            this.setState(respJson, () => this.setState({isLoaded: true}))
        });
    }

    isLoaded() {
        return this.state.isLoaded;
    }

    updateTestState() {
        fetch(window.location.origin + "/api/tests/" + this.state.courseNumber + "/" + this.state.courseYear + "/" + this.state.assName + "/" + this.state.name, {method: "PATCH"}).then((resp) => {
            if (resp.status !== 200) {
                alert("error updating test state. Status code is " + resp.status);
            } else {
                alert("test state updated successfully");
            }
            this.props.history.go(0);
        });
    }

    runsOnIntToStr(val) {
        if (val === 0) {
            return "Submit"
        } else if (val === 1) {
            return "Demand"
        }
        alert("invalid runs_on value");
        this.props.history.push("/internal-error");
        this.props.history.go(0);
    }

    setOsType = e => this.setState({os_type: e.target.value});
    setArchitecture = e => this.setState({architecture: e.target.value});
    setRunsOn = e => this.setState({runs_on: parseInt(e.target.value), runs_on_str: this.runsOnIntToStr(parseInt(e.target.value))});

    update(event) {
        event.preventDefault(event);
        fetch(window.location.origin + "/api/tests/" + this.state.courseNumber + "/" + this.state.courseYear + "/" + this.state.assName + "/" + this.state.name,
        {method: "PUT", body: JSON.stringify({command: event.target.command.value, os_type: this.state.os_type, architecture: this.state.architecture,
            files: this.state.files, runs_on: this.state.runs_on, timeout: this.state.timeout 
        })}).then((resp) => {
            if (resp.status !== 202) {
                alert("error updating test. Status code is " + resp.status);
            } else {
                alert("test updated successfully");
            }
            this.props.history.go(0);
        })
    }

    render() {
        let shouldAssBeLink = doesUserHaveRole("admin") || isStaffCourse(this.state.courseNumber + ":" + this.state.courseYear);
        let allowPublishButton = shouldAssBeLink;
        let allowOnSubmitChoice = allowPublishButton;
        let allowMod = allowPublishButton || this.state.created_by === getLoggedInUserName();
        return (
            <div>
                {this.isLoaded() && <Form onSubmit={this.update}>
                    <Form.Row>
                        <div className="input-group">
                            <Col md style={{margin: 5}}>
                                <Form.Group controlId="course">
                                    <Form.Label>Course:</Form.Label>
                                    <div style={{borderStyle: "solid", borderWidth: 1, borderRadius: 3, borderColor: "#D3D3D3", backgroundColor: "#E8E8E8", padding: 5}}>
                                        <a href={window.location.origin + "/courses/" + this.state.courseNumber + "/" + this.state.courseYear}>{this.state.courseNumber + "/" + this.state.courseYear}</a>
                                    </div>
                                </Form.Group>
                            </Col>
                            <Col md style={{margin: 5}}>
                                <Form.Group controlId="course">
                                    <Form.Label>Assignment:</Form.Label>
                                    <div style={{borderStyle: "solid", borderWidth: 1, borderRadius: 3, borderColor: "#D3D3D3", backgroundColor: "#E8E8E8", padding: 5}}>
                                        {shouldAssBeLink && <a href={window.location.origin + "/assignment_definitions/" + this.state.courseNumber + "/" + this.state.courseYear + "/" + this.state.assName}>{this.state.courseNumber + "/" + this.state.courseYear + "/" + this.state.assName}</a>}
                                        {!shouldAssBeLink && <div>{this.state.courseNumber + "/" + this.state.courseYear + "/" + this.state.assName}</div>}
                                    </div>
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
                    <Form.Row>
                    <div className="input-group">
                        <Col md style={{margin: 5}}>
                            <Form.Group controlId="command">
                                <Form.Label>Command:</Form.Label>
                                <Form.Control disabled={!allowMod} defaultValue={this.state.command}/>
                            </Form.Group>
                        </Col>
                    </div>
                    </Form.Row>
                    <Form.Row>
                        <div className="input-group">
                            <Col md style={{margin: 5}}>
                                <Form.Group>
                                    <Form.Label>OS Type:</Form.Label>
                                    <Form.Control disabled={!allowMod} as="select" value={this.state.os_type} onChange={this.setOsType}>
                                        <option value="linux">Linux</option>
                                        <option value="windows">Windows</option>
                                        <option value="darwin">Darwin</option>
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col md style={{margin: 5}}>
                                <Form.Group>
                                    <Form.Label>Architecture:</Form.Label>
                                    <Form.Control disabled={!allowMod} as="select" value={this.state.architecture} onChange={this.setArchitecture}>
                                        <option value="amd64">X86-64</option>
                                        <option value="386">i386</option>
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col md style={{margin: 5}}>
                                <Form.Group>
                                    <Form.Label>Runs On:</Form.Label>
                                    <Form.Control disabled={!allowMod || !allowOnSubmitChoice} as="select" value={this.state.runs_on} onChange={this.setRunsOn}>
                                        <option value="0">Submit</option>
                                        <option value="1">Demand</option>
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col md style={{margin: 5}}>
                                <Form.Group>
                                    <Form.Label>Timeout:</Form.Label>
                                    <Form.Control disabled={!allowMod} type="number" value={this.state.timeout} onChange={e => this.setState({timeout: parseInt(e.target.value)})}/>
                                </Form.Group>
                            </Col>
                        </div>
                    </Form.Row>
                    <Form.Row>
                        <div className="input-group">
                            <Col md style={{margin: 5}}>
                                <div>State:</div>
                            </Col>
                            <Col md={16} style={{margin: 5}}>
                                <Form.Control disabled value={this.state.state_str}/>
                            </Col>
                            <Col md style={{margin: 5}}>
                                {allowMod && this.state.state === 0 && <Button onClick={this.updateTestState} variant="primary">Submit For Review</Button>}
                                {this.state.state === 1 && allowPublishButton && <Button onClick={this.updateTestState} variant="primary">Publish</Button>}
                            </Col>
                        </div>
                    </Form.Row>
                    {allowMod && <Form.Row>
                        <div className="input-group">
                            <Col md style={{margin: 5}}>
                                <Form.Label>Actions:</Form.Label>
                            </Col>
                            <Col md style={{margin: 5}}>
                                <Button style={{margin: 5}} variant="primary" type="submit">Update</Button>
                            </Col>
                        </div>
                    </Form.Row>}
                    <Form.Row>
                        <Col md style={{margin: 5}}>
                            <Form.Group>
                                <Form.Label>Files:</Form.Label>
                                <FormFiles allowModification={allowMod} elementBucket="tests" elementKey={this.state.courseNumber + "/" + this.state.courseYear + "/" + this.state.assName + "/" + this.state.name} files={this.state.files} history={this.props.history}/>
                            </Form.Group>
                        </Col>
                    </Form.Row>
                    {allowMod && <Form.Row>
                        <Col md style={{margin: 5}}>
                            <Form.Group>
                                <Form.Label>Messages:</Form.Label>
                                <FormMessages elementBucket="tests" elementKey={this.state.courseNumber + "/" + this.state.courseYear + "/" + this.state.assName + "/" + this.state.name} history={this.props.history}/>
                            </Form.Group>
                        </Col>
                    </Form.Row>}
                </Form>}
            </div>
        )
    }

}

