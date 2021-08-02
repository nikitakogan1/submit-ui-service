import { Component } from "react";
import { Form, Spinner } from "react-bootstrap";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import FormFiles from "../FormFiles/FormFiles.js";
import BootstrapTable from 'react-bootstrap-table-next';

export default class AssignmentDef extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            course: "",
            course_number: "",
            course_year: "",
            name: "",
            due_by: "",
            state: 0,
            state_str: "",
            files: {elements:{}},
            showDateModal: false,
            showAssInstModal: false,
            showTestsModal: false,
            showMossModal: false,
            mossLanguage: "c",
            showPollingModal: false,
            task_id: "",
            pollingInterval: 0,
            showPollingSpinner: false,
            showPollingResult: false,
            pollingResult: null,
            showPollingError: false,
            pollingError: ""
        }
        this.isLoaded = this.isLoaded.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.updateDate = this.updateDate.bind(this);
        this.update = this.update.bind(this);
        this.createMossRequest = this.createMossRequest.bind(this);
        this.onPollingModalClose = this.onPollingModalClose.bind(this);
    }

    isLoaded() {
        return this.state.isLoaded;
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
        }).then((data) => {
            if (data !== null) {
                let splitted = data.course.split(":");
                if (splitted.length !== 2) {
                    alert("invalid course key '" + data.course + "' returned from backend");
                    this.props.history.push("/internal-error");
                    this.props.history.go(0);
                    return null;
                }
                data["course_number"] = splitted[0];
                data["course_year"] = splitted[1];
                if (data.state === 0) {
                    data["state_str"] = "Draft"
                } else if (data.state === 1) {
                    data["state_str"] = "Published"
                } else {
                    alert("invalid assignment def state '" + data.state.toString() + "' returned from backend");
                    this.props.history.push("/internal-error");
                    this.props.history.go(0);
                    return null;
                }
            }
            this.setState(data, () => this.setState({isLoaded: true}))
        });
    }

    updateDate(event) {
        event.preventDefault(event);
        let dueBy;
        try {
            dueBy = new Date(event.target.due_by_date.value + "T" + event.target.due_by_time.value).toISOString();
        } catch(e) {
            alert("invalid date/time values");
            return;
        }
        this.setState({due_by: dueBy, showDateModal: false});
    }

    update(event) {
        event.preventDefault(event);
        fetch(window.location.origin + "/api/assignment_definitions/" + this.state.course_number + "/" + this.state.course_year + "/" + this.state.name,
        {method: "PUT", "headers": {"X-Submit-Ass": this.state.course_number + ":" + this.state.course_year + ":" + this.state.name},
        body: JSON.stringify({due_by: new Date(event.target.due_by.value), files: this.state.files})}).then((resp) => {
            if (resp.status !== 202) {
                alert("error updating assignment definition. Status code is " + resp.status);
            } else {
                alert("assignment definition updated successfully");
            }
            this.props.history.go(0);
        })
    }

    createMossRequest(e) {
        e.preventDefault(e);
        fetch(window.location.origin + "/api/moss_request/", {method: "POST",
        body: JSON.stringify({
            assignment_def: this.course_number + ":" + this.course_year + ":" + this.name,
            users: null,
            sensitivity: parseInt(e.target.sensitivity.value),
            percentage: parseInt(e.target.threshold.value),
            language: e.target.language.value,
            timeout: parseInt(e.target.timeout.value)
        })}).then((resp) => {
            if (resp.status !== 202) {
                alert("error creating test. Status code is " + resp.status);
                return null;
            }
            return resp.json();
        }).then((data) => {
            if (data !== null) {
                this.setState({task_id: data.task_id}, () => this.setState({showPollingModal: true, showPollingSpinner: true, showMossModal: false, pollingInterval: setInterval(() => {
                    // TODO: make request to backend and update ui accordingly
                }, 3000)}))
            }
        })
    }

    onPollingModalClose() {
        clearInterval(this.state.pollingInterval)
        this.props.history.go(0);
    }

    setMossLanguage = e => this.setState({mossLanguage: e.target.value})

    render() {
        return (
            <div>
                {this.isLoaded() && <Modal open={this.state.showPollingModal} center onClose={this.onPollingModalClose}>
                    <br></br>
                    <div style={{width: 475, height: 375}}>
                        {this.state.showPollingSpinner && <Spinner animation="border" variant="primary"/>}
                        {this.state.showPollingResult && <div>{JSON.stringify(this.state.pollingResult)}</div>}
                        {this.state.showPollingError && <div>{this.state.pollingError}</div>}
                    </div>
                </Modal>}
                {this.isLoaded() && <Modal open={this.state.showMossModal} center onClose={() => this.setState({showMossModal: false})}>
                        <br></br>
                        <div style={{width: 475, height: 375}}><Form onSubmit={this.createMossRequest}>
                        <div class="input-group"><Form.Row>
                                <Form.Group style={{width: 280, margin: 5}} controlId="language">
                                    <Form.Label>Language:</Form.Label>
                                    <Form.Control as="select" value={this.state.mossLanguage} onChange={this.setMossLanguage}>
                                        <option value="c">C</option>
                                        <option value="cc">C++</option>
                                        <option value="java">Java</option>
                                        <option value="ml">ML</option>
                                        <option value="pascal">Pascal</option>
                                        <option value="ada">Ada</option>
                                        <option value="lisp">Lisp</option>
                                        <option value="scheme">Scheme</option>
                                        <option value="haskell">Haskell</option>
                                        <option value="fortran">Fortran</option>
                                        <option value="ascii">Ascii</option>
                                        <option value="vhdl">VHDL</option>
                                        <option value="perl">Perl</option>
                                        <option value="python">Python</option>
                                        <option value="mips">MIPS</option>
                                        <option value="prolog">Prolog</option>
                                        <option value="spice">SPICE</option>
                                        <option value="vb">Visual Basic</option>
                                        <option value="csharp">C#</option>
                                        <option value="modula2">Modula-2</option>
                                        <option value="a8086">x86 Assembly</option>
                                        <option value="spice">SPICE</option>
                                        <option value="javascript">JavaScript</option>
                                        <option value="plsql">PL/SQL</option>
                                        <option value="verilog">Verilog</option>
                                    </Form.Control>
                                </Form.Group>
                            </Form.Row>
                            <Form.Row>
                                <Form.Group style={{width: 280, margin: 5}} controlId="sensitivity">
                                    <Form.Label>Sensitivity:</Form.Label>
                                    <Form.Control type="number" placeholder="Enter Sensitivity"/>
                                </Form.Group>
                            </Form.Row>
                            <Form.Row>
                                <Form.Group style={{width: 280, margin: 5}} controlId="threshold">
                                    <Form.Label>Threshold:</Form.Label>
                                    <Form.Control type="number" placeholder="Enter Threshold"/>
                                </Form.Group>
                            </Form.Row>
                            <Form.Row>
                                <Form.Group style={{width: 280, margin: 5}} controlId="timeout">
                                    <Form.Label>Timeout:</Form.Label>
                                    <Form.Control type="number" placeholder="Enter Timeout"/>
                                </Form.Group>
                            </Form.Row>
                            <Button style={{margin: 5}} variant="primary" type="submit">Submit</Button>
                            </div>
                        </Form>
                        </div>
                    </Modal>}
                {this.isLoaded && <Modal open={this.state.showAssInstModal} center onClose={() => this.setState({showAssInstModal: false})}>
                        <br></br>
                        <div style={{maxHeight: 600, maxWidth: 600}}><InstancesOfDef courseNumber={this.state.course_number} courseYear={this.state.course_year} assName={this.state.name} history={this.props.history}/></div>
                    </Modal>}
                {this.isLoaded && <Modal open={this.state.showTestsModal} center onClose={() => this.setState({showTestsModal: false})}>
                        <br></br>
                        <div style={{height: 275, maxWidth: 600}}><TestsOfDef courseNumber={this.state.course_number} courseYear={this.state.course_year} assName={this.state.name} history={this.props.history}/></div>
                    </Modal>}    
                {this.isLoaded() && <Modal open={this.state.showDateModal} center onClose={() => this.setState({showDateModal: false})}>
                        <br></br>
                        <div style={{width: 445, height: 225}}><Form onSubmit={this.updateDate}>
                            <div className="input-group">
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
                                <Button style={{margin: 5}} variant="primary" type="submit">Save</Button></div>
                        </Form></div>
                    </Modal>}
                {this.isLoaded() && <Form onSubmit={this.update}>
                    <Form.Row>
                        <div className="input-group">
                            <Col md style={{margin: 5}}>
                                <Form.Group controlId="course">
                                    <Form.Label>Course:</Form.Label>
                                    <div style={{borderStyle: "solid", borderWidth: 1, borderRadius: 3, borderColor: "#D3D3D3", backgroundColor: "#E8E8E8", padding: 5}}>
                                        <a href={window.location.origin + "/courses/" + this.state.course_number + "/" + this.state.course_year}>{this.state.course_number + "/" + this.state.course_year}</a>
                                    </div>
                                </Form.Group>
                            </Col>
                            <Col md style={{margin: 5}}>
                                <Form.Group controlId="name">
                                    <Form.Label>Name:</Form.Label>
                                    <Form.Control disabled value={this.state.name}/>
                                </Form.Group>
                            </Col>
                            <Col md style={{margin: 5}}>
                                <Form.Label>State:</Form.Label>
                                <Form.Control disabled value={this.state.state_str}/>
                            </Col>
                        </div>
                    </Form.Row>
                    <Form.Row>
                        <div className="input-group">
                            <Col md style={{margin: 5}}>
                                <div>Submission Date:</div>
                            </Col>
                            <Col md={8} style={{margin: 5}}>
                                <Form.Group controlId="due_by">
                                    <Form.Control disabled value={new Date(this.state.due_by)} />
                                </Form.Group>
                            </Col>
                            <Col md>
                                <Button onClick={() => this.setState({showDateModal: true})} style={{margin: 5}} variant="primary"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-clock" viewBox="0 0 16 16">
  <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
  <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
</svg></Button>
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
                                {this.state.state === 0 && <Button variant="primary">Publish</Button>}
                            </Col>
                        </div>
                    </Form.Row>
                    <Form.Row>
                        <div className="input-group">
                            <Col md style={{margin: 5}}>
                                <Form.Label>Actions:</Form.Label>
                            </Col>
                            <Col md style={{margin: 5}}>
                                <Button style={{margin: 5}} variant="primary" type="submit">Update</Button>
                            </Col>
                            <Col md style={{margin: 5}}>
                                <Button variant="primary" style={{margin: 5}} onClick={() => this.setState({showTestsModal: true})}>Tests</Button>
                            </Col>
                            <Col md style={{margin: 5}}>
                                <Button variant="primary" style={{margin: 5}} onClick={() => this.setState({showAssInstModal: true})}>Instances</Button>
                            </Col>
                            {this.state.state === 1 && <Col md style={{margin: 5}}>
                                <Button variant="primary" style={{margin: 5}} onClick={() => this.setState({showMossModal: true})}>Moss</Button>
                            </Col>}
                        </div>
                    </Form.Row>
                    <Form.Row>
                        <Col md style={{margin: 5}}>
                            <Form.Group style={{width: 500}}>
                                <Form.Label>Files:</Form.Label>
                                <FormFiles allowModification={true} elementBucket="assignment_definitions" elementKey={this.state.course_number + "/" + this.state.course_year + "/" + this.state.name} files={this.state.files} history={this.props.history}/>
                            </Form.Group>
                        </Col>
                    </Form.Row>
                    <br></br><br></br><br></br>
                </Form>}
            </div>
        )
    }

}

const AlertNoInstances = () => <div className="alert alert-info" role="alert">No Instances Here...</div>;
const AlertNoTests = () => <div className="alert alert-info" role="alert">No Tests Here...</div>;

class InstancesOfDef extends Component {

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
        this.assName = props.assName;
        this.isLoaded = this.isLoaded.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.previousPage = this.previousPage.bind(this);
        this.nextPage = this.nextPage.bind(this);
        this.goToBackEnd = this.goToBackEnd.bind(this);
    }

    isLoaded() {
        return this.state.isLoaded;
    }

    goToBackEnd() {
        var url = window.location.origin + '/api/assignment_instances/?limit='+ this.state.limit
        if (this.state.after_id > 0) {
          url = url + "&after_id=" + this.state.after_id
        }
        fetch(url, {method:'GET', 
        headers: {'X-Submit-Ass': this.courseNumber + ":" + this.courseYear + ":" + this.assName}})
        .then((response) => {
          if (response.status !== 200){
            alert("error fetching assignment instances for definition. Status code is " + response.status)  
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
        .then(data => this.setState({elements:data.elements}, () => this.setState({isLoaded: true})));
    }

    componentDidMount() {
        this.goToBackEnd();
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

    columns = [{
        dataField: "user_name",
        text: "User",
        formatter: (cell) => <a href={window.location.origin + "/assignment_instances/" + this.courseNumber + "/" + this.courseYear + "/" + this.assName + "/" + cell}>{cell}</a>
    },{
        dataField: "state",
        text: "State",
        formatter: (cell) => {
            if (cell === 0) {
                return <h10>Assigned</h10>
            } else if (cell === 1) {
                return <h10>Submitted</h10>
            } else if (cell === 2) {
                return <h10>Graded</h10>
            }
            return <h10>Invalid</h10>
        }
    },{
        dataField: "due_by",
        text: "Due By",
        formatter: (cell) => <h10>{new Date(cell).toString()}</h10>
    },{
        dataField: "copy",
        text: "Copy"
    },{
        dataField: "grade",
        text: "Grade"
    }]

    render() {
        return (
            <div>
                {this.isLoaded() && this.state.elements !== null && <div><br></br><BootstrapTable hover keyField="assignment_def" data={ this.state.elements } columns={ this.columns }/></div>}
                {this.isLoaded() && this.state.elements === null && <div><br></br><AlertNoInstances/></div>}
                <br></br>
                {this.isLoaded() && <div className="input-group">
                        {this.state.after_id > 0 && <Button variant="primary" onClick={this.previousPage} style={{position: "absolute", left: 0}}>Previous</Button>}
                        {this.state.left_to_process && <Button variant="primary" onClick={this.nextPage} style={{position: "absolute", right: 0}}>Next</Button>}
                    </div>}
                <br></br><br></br> 
            </div>
        )
    }

}

class TestsOfDef extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            left_to_process: false,
            limit: 5,
            after_id: 0,
            elements: null,
            testToDelete: null,
            showNewTestModal: false,
            newTestOsType: "linux",
            newTestArch: "amd64",
            newTestRunsOn: 0,
        };
        this.courseNumber = props.courseNumber;
        this.courseYear = props.courseYear;
        this.assName = props.assName;
        this.isLoaded = this.isLoaded.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.previousPage = this.previousPage.bind(this);
        this.nextPage = this.nextPage.bind(this);
        this.goToBackEnd = this.goToBackEnd.bind(this);
        this.deleteTest = this.deleteTest.bind(this);
        this.createTest = this.createTest.bind(this);
        this.setNewTestOsType = this.setNewTestOsType.bind(this);
        this.setNewTestArch = this.setNewTestArch.bind(this);
        this.setNewTestRunsOn = this.setNewTestRunsOn.bind(this);
    }

    isLoaded() {
        return this.state.isLoaded;
    }

    goToBackEnd() {
        var url = window.location.origin + '/api/tests/?limit='+ this.state.limit
        if (this.state.after_id > 0) {
          url = url + "&after_id=" + this.state.after_id
        }
        fetch(url, {method:'GET', 
        headers: {'X-Submit-Ass': this.courseNumber + ":" + this.courseYear + ":" + this.assName}})
        .then((response) => {
          if (response.status !== 200){
            alert("error fetching tests for assignment definition. Status code is " + response.status)  
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
                data.elements[i]["key"] = data.elements[i]["assignment_def"] + ":" + data.elements[i]["name"];
            } 
          }
          this.setState({elements:data.elements}, () => this.setState({isLoaded: true}));
        });
    }

    componentDidMount() {
        this.goToBackEnd();
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

    onTestSelectedForDeletion = (row, isSelect, rowIndex, e) => {
        this.setState({testToDelete: row.name});
    }

    deleteTest() {
        fetch(window.location.origin + "/api/tests/" + this.courseNumber + "/" + this.courseYear + "/" + this.assName + "/" + this.state.testToDelete,
        {method: "DELETE"}).then((resp) => {
            if (resp.status !== 200) {
                alert("error deleting test. Status code is " + resp.status);
            } else {
                alert("test deleted successfully");
            }
            this.props.history.go(0);
        }).catch(err => alert(err));
    }

    createTest(event) {
        event.preventDefault(event);
        fetch(window.location.origin + "/api/tests/", {method: "POST", body:JSON.stringify({
            assignment_def: this.courseNumber + ":" + this.courseYear + ":" + this.assName,
            name: event.target.name.value,
            command: event.target.command.value,
            os_type: this.state.newTestOsType,
            architecture: this.state.newTestArch,
            timeout: parseInt(event.target.timeout.value),
            runs_on: this.state.newTestRunsOn
        })}).then((resp) => {
            if (resp.status !== 202) {
                alert("error creating test. Status code is " + resp.status);
            } else {
                alert("test created successfully");
            }
            this.props.history.go(0);
        })
    }

    selectTestToDelete = {
        mode: "radio",
        clickToSelect: false,
        onSelect: this.onTestSelectedForDeletion
    }

    columns = [{
<<<<<<< Updated upstream
        dataField: 'name',
        formatter: (cell, row) => <a href={"/assignment_definitions/" + row.course.replaceAll(":","/") + "/" + cell}> {cell} </a>,
        text: 'Assignment name',
      }, {
        dataField: 'due_by',
        text: 'Due by',
        formatter: (cell, row) => <h10>{new Date(cell).toString()}</h10>
      }, {
        dataField: 'state',
        text: 'State',
        formatter: (cell, row) => <h10>{cell === 0 ? "Drafted" : "Published"} </h10>
      },
      {
        dataField: 'course',
        text: 'Course',
        formatter: (cell, row) => <h10>{cell.replaceAll(":","/")} </h10>
      },
    ];
    render(){
      return (
    <div className="AssignmentList">
    <p className="Table-header"></p>
     
    {this.state.elements !== null && <BootstrapTable hover keyField='assignment_def' data={ this.state.elements } columns={ this.columns } />}
    </div>
      );
      }
  
   }
=======
        dataField: "name",
        text: "Name",
        formatter: (cell) => <a href={window.location.origin + "/tests/" + this.courseNumber + "/" + this.courseYear + "/" + this.assName + "/" + cell}>{cell}</a>
    },{
        dataField: "state",
        text: "State",
        formatter: (cell) => {
            if (cell === 0) {
                return <h10>Draft</h10>
            } else if (cell === 1) {
                return <h10>In Review</h10>
            } else if (cell === 2) {
                return <h10>Published</h10>
            }
            return <h10>Invalid</h10>
        }
    },{
        dataField: "runs_on",
        text: "Runs On",
        formatter: (cell) => {
            if (cell === 0) {
                return <h10>Submit</h10>
            } else if (cell === 1) {
                return <h10>Demand</h10>
            }
            return <h10>Invalid</h10>
        }
    }]

    setNewTestOsType = e => this.setState({newTestOsType: e.target.value})
    setNewTestArch = e => this.setState({newTestArch: e.target.value})
    setNewTestRunsOn = e => this.setState({newTestRunsOn: parseInt(e.target.value)})

    render() {
        return (
            <div>
                <Modal open={this.state.showNewTestModal} center onClose={() => this.setState({showNewTestModal: false})}>
                    <br></br>
                    <div style={{width: 455, height: 275}}><Form onSubmit={this.createTest}>
                        <div className="input-group"><Form.Row>
                            <Form.Group style={{width: 280, margin: 5}} controlId="name">
                                <Form.Label>Name:</Form.Label>
                                <Form.Control placeholder="Enter test name"/>
                            </Form.Group>
                        </Form.Row>
                        <Form.Row>
                            <Form.Group style={{width: 280, margin: 5}} controlId="command">
                                <Form.Label>Command:</Form.Label>
                                <Form.Control placeholder="Enter command"/>
                            </Form.Group>
                        </Form.Row>
                        <Form.Row>
                            <Form.Group style={{width: 280, margin: 5}} controlId="os_type">
                                <Form.Label>OS Type:</Form.Label>
                                <Form.Control as="select" value={this.newTestOsType} onChange={this.setNewTestOsType}>
                                    <option value="linux">Linux</option>
                                    <option value="windows">Windows</option>
                                    <option value="darwin">Darwin</option>
                                </Form.Control>
                            </Form.Group>
                        </Form.Row>
                        <Form.Row>
                            <Form.Group style={{width: 280, margin: 5}} controlId="architecture">
                                <Form.Label>Architecture:</Form.Label>
                                <Form.Control as="select" value={this.newTestArch} onChange={this.setNewTestArch}>
                                    <option value="amd64">X86-64</option>
                                    <option value="386">i386</option>
                                </Form.Control>
                            </Form.Group>
                        </Form.Row>
                        <Form.Row>
                            <Form.Group style={{width: 280, margin: 5}} controlId="timeout">
                                <Form.Label>Timeout:</Form.Label>
                                <Form.Control type="number" placeholder="Enter Timeout"/>
                            </Form.Group>
                        </Form.Row>
                        <Form.Row>
                            <Form.Group style={{width: 280, margin: 5}} controlId="runs_on">
                                <Form.Label>Runs On:</Form.Label>
                                <Form.Control as="select" value={this.newTestRunsOn} onChange={this.setNewTestRunsOn}>
                                    <option value="0">Submit</option>
                                    <option value="1">Demand</option>
                                </Form.Control>
                            </Form.Group>
                        </Form.Row>
                        <Button style={{margin: 5}} variant="primary" type="submit">Submit</Button></div>
                    </Form></div>
                </Modal>
                {this.isLoaded() && this.state.elements !== null && <div><br></br><BootstrapTable hover keyField="key" data={ this.state.elements } columns={ this.columns } selectRow={this.selectTestToDelete}/></div>}
                {this.isLoaded() && this.state.elements === null && <div><br></br><AlertNoTests/></div>}
                <br></br>
                {this.isLoaded() && <div className="input-group">
                    {this.state.after_id > 0 && <Button variant="primary" onClick={this.previousPage} style={{position: "absolute", left: 0}}>Previous</Button>}
                    {this.state.left_to_process && <Button variant="primary" onClick={this.nextPage} style={{position: "absolute", right: 0}}>Next</Button>}
                </div>}
                <br></br><br></br> 
                {this.isLoaded() && <div className="input-group">
                    {this.state.elements !== null && <Button disabled={this.state.testToDelete === null} style={{position: "absolute", left: 0}} onClick={this.deleteTest}>Delete</Button>}
                    <Button style={{position: "absolute", right: 0}} onClick={() => {this.setState({showNewTestModal: true})}}>New</Button>
                </div>}
            </div>
        )
    }

}
>>>>>>> Stashed changes
