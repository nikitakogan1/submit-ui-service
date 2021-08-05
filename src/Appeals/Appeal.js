import { Component } from "react";
import { Form } from "react-bootstrap";
import Col from "react-bootstrap/Col";
import { doesUserHaveRole, isStaffCourse } from "../Utils/session";
import Button from "react-bootstrap/Button";
import FormMessages from "../FormMessages/FormMessages";

export default class Appeal extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            courseNumber: "",
            courseYear: "",
            assName: "",
            userName: "",
            state: 0,
            stateStr: "",
        }
        this.isLoaded = this.isLoaded.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.updateAppealState = this.updateAppealState.bind(this);
    }

    isLoaded() {
        return this.state.isLoaded;
    }

    componentDidMount() {
        this.props.navbar(true);
        fetch(window.location.origin + "/api" + window.location.pathname).then((resp) => {
            if (resp.status === 403) {
                this.props.history.push("/unauthorized");
                this.props.history.go(0);
            } else if (resp.status === 404) {
                this.props.history.push("/not-found");
                this.props.history.go(0);
            } else if (resp.status !== 200) {
                this.props.history.push("/internal-error");
                this.props.history.go(0);
            }
            return resp.json();
        }).then((data) => {
            if (data !== null) {
                let splitted = data.assignment_instance.split(":");
                if (splitted.length !== 4) {
                    alert("invalid assignment instance key '" + data.assignment_instance + "' returned from backend");
                    this.props.history.push("/internal-error");
                    this.props.history.go(0);
                    return null;
                }
                data["courseNumber"] = splitted[0];
                data["courseYear"] = splitted[1];
                data["assName"] = splitted[2];
                data["userName"] = splitted[3];
                if (data.state === 0) {
                    data["stateStr"] = "Open";
                } else if (data.state === 1) {
                    data["stateStr"] = "Closed";
                } else {
                    alert("invalid appeal state '" + data.state.toString() + "' returned from backend");
                    this.props.history.push("/internal-error");
                    this.props.history.go(0);
                    return null;
                }
            }
            this.setState(data, () => this.setState({isLoaded: true}));
        })
    }

    updateAppealState() {
        fetch(window.location.origin + "/api" + window.location.pathname, {method: "PATCH", headers: {"X-Submit-State": this.state.state === 0 ? "closed" : "open"}}).then((resp) => {
            if (resp.status !== 200) {
                alert("error updating appeal state. Status code is " + resp.status);
            } else {
                alert("successfully updated appeal state");
            }
            this.props.history.go(0);
        })
    }

    render() {
        let isUserStaff = doesUserHaveRole("admin") || isStaffCourse(this.state.courseNumber + ":" + this.state.courseYear);
        return (
            <div>
                {this.isLoaded() && <Form>
                    <Form.Row>
                        <div className="input-group">
                            <Col md style={{margin: 5}}>
                                <Form.Group controlId="courseNumber">
                                    <Form.Label>Course Number:</Form.Label>
                                    <div style={{borderStyle: "solid", borderWidth: 1, borderRadius: 3, borderColor: "#D3D3D3", backgroundColor: "#E8E8E8", padding: 5}}>
                                        <a href={window.location.origin + "/courses/" + this.state.courseNumber + "/" + this.state.courseYear}>{this.state.courseNumber}</a>
                                    </div>
                                </Form.Group>
                            </Col>
                            <Col md style={{margin: 5}}>
                                <Form.Group controlId="courseNumber">
                                    <Form.Label>Course Year:</Form.Label>
                                    <Form.Control disabled value={this.state.courseYear}/>
                                </Form.Group>
                            </Col>
                            <Col md style={{margin: 5}}>
                                <Form.Group controlId="courseNumber">
                                    <Form.Label>Assignment:</Form.Label>
                                    <div style={{borderStyle: "solid", borderWidth: 1, borderRadius: 3, borderColor: "#D3D3D3", backgroundColor: "#E8E8E8", padding: 5}}>
                                        {isUserStaff && <a href={window.location.origin + "/assignment_definitions/" + this.state.courseNumber + "/" + this.state.courseYear + "/" + this.state.assName}>{this.state.assName}</a>}
                                        {!isUserStaff && <a href={window.location.origin + "/assignment_instances/" + this.state.courseNumber + "/" + this.state.courseYear + "/" + this.state.assName + "/" + this.state.userName}>{this.state.assName}</a>}
                                    </div>
                                </Form.Group>
                            </Col>
                            <Col md style={{margin: 5}}>
                                <Form.Group controlId="courseNumber">
                                    <Form.Label>Student:</Form.Label>
                                    <div style={{borderStyle: "solid", borderWidth: 1, borderRadius: 3, borderColor: "#D3D3D3", backgroundColor: "#E8E8E8", padding: 5}}>
                                        {isUserStaff && <a href={window.location.origin + "/assignment_instances/" + this.state.courseNumber + "/" + this.state.courseYear + "/" + this.state.assName + "/" + this.state.userName}>{this.state.userName}</a>}
                                        {!isUserStaff && <div>{this.state.userName}</div>}
                                    </div>
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
                                <Form.Control disabled value={this.state.stateStr}/>
                            </Col>
                            <Col md style={{margin: 5}}>
                                <Button onClick={this.updateAppealState} variant="primary">{this.state.state === 0 ? "Close" : "Open"}</Button>
                            </Col>
                        </div>
                    </Form.Row>
                    <Form.Row>
                        <Col md style={{margin: 5}}>
                            <Form.Group>
                                <Form.Label>Messages:</Form.Label>
                                <FormMessages elementBucket="appeals" elementKey={this.state.courseNumber + "/" + this.state.courseYear + "/" + this.state.assName + "/" + this.state.userName} history={this.props.history}/>
                            </Form.Group>
                        </Col>
                    </Form.Row>
                </Form>}
            </div>
        )
    }

}
