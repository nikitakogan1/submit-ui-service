import { Component, Fragment } from "react";
import { Form, Spinner } from "react-bootstrap";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import FormFiles from "../FormFiles/FormFiles.js";
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';

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
            pollingResultMatches: "",
            pollingResultLink: null,
            showPollingError: false,
            pollingErrStatusCode: 0,
            showAppealsModal: false,
            required_files: {elements:{}},
            selectedRequiredFile: "",
            showNewRequiredFileModal: false
        }
        this.isLoaded = this.isLoaded.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.updateDate = this.updateDate.bind(this);
        this.update = this.update.bind(this);
        this.createMossRequest = this.createMossRequest.bind(this);
        this.onPollingModalClose = this.onPollingModalClose.bind(this);
        this.publish = this.publish.bind(this);
        this.removeRequiredFile = this.removeRequiredFile.bind(this);
        this.addRequiredFile = this.addRequiredFile.bind(this);
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
        body: JSON.stringify({due_by: new Date(event.target.due_by.value), files: this.state.files, required_files: this.state.required_files})}).then((resp) => {
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
        fetch(window.location.origin + "/api/moss_requests/", {method: "POST",
        body: JSON.stringify({
            assignment_def: this.state.course_number + ":" + this.state.course_year + ":" + this.state.name,
            users: null,
            sensitivity: parseInt(e.target.sensitivity.value),
            percentage: parseInt(e.target.threshold.value),
            language: e.target.language.value,
            timeout: parseInt(e.target.timeout.value)
        })}).then((resp) => {
            if (resp.status !== 202) {
                alert("error creating moss request. Status code is " + resp.status);
                return null;
            }
            return resp.json();
        }).then((data) => {
            if (data !== null) {
                this.setState({task_id: data.task_id}, () => this.setState({showPollingModal: true, showPollingSpinner: true, showMossModal: false, pollingInterval: setInterval(() => {
                    fetch(window.location.origin + "/api/moss_requests/" + this.state.task_id).then((resp) => {
                        if (resp.status === 200) {
                            clearInterval(this.state.pollingInterval)
                            return resp.json();
                        } else if (resp.status !== 202) {
                            clearInterval(this.state.pollingInterval)
                            this.setState({pollingErrStatusCode: resp.status, showPollingSpinner: false, showPollingError: true});
                            return null;
                        }
                        return null;
                    }).then((data) => {
                        if (data !== null) {
                            let mossOutput = JSON.parse(data.payload);
                            this.setState({pollingResultMatches: mossOutput.matches, pollingResultLink: mossOutput.link, showPollingSpinner: false, showPollingResult: true});
                        }
                    })
                }, 3000)}))
            }
        })
    }

    onPollingModalClose() {
        clearInterval(this.state.pollingInterval)
        this.props.history.go(0);
    }

    setMossLanguage = e => this.setState({mossLanguage: e.target.value})

    mossMatchesColumns = [{
        dataField: "name1",
        text: "Name 1",
        formatter: (cell) => <a href={window.location.origin + "/assignment_instances/" + this.state.course_number + "/" + this.state.course_year + "/" + this.state.name + "/" + cell}>{cell}</a>
    },{
        dataField: "percentage1",
        text: "Percentage 1"
    },{
        dataField: "name2",
        text: "Name 2",
        formatter: (cell) => <a href={window.location.origin + "/assignment_instances/" + this.state.course_number + "/" + this.state.course_year + "/" + this.state.name + "/" + cell}>{cell}</a>
    },{
        dataField: "percentage2",
        text: "Percentage 2"
    }]

    publish() {
        fetch(window.location.origin + "/api/assignment_definitions/" + this.state.course_number + "/" + this.state.course_year + "/" + this.state.name, {method: "PATCH"}).then((resp) => {
            if (resp.status !== 200) {
                alert("error publishing assignment. Status code is " + resp.status);
            } else {
                alert("assignment published successfully");
            }
            this.props.history.go(0);
        });
    }

    onRequiredFileSelection = (row, isSelect, rowIndex, e) => {
        this.setState({selectedRequiredFile: row.file_name});
    }

    selectRequiredFile = {
        mode: "radio",
        clickToSelect: false,
        onSelect: this.onRequiredFileSelection
    }

    removeRequiredFile() {
        let reqFiles = JSON.parse(JSON.stringify(this.state.required_files))
        delete reqFiles.elements[this.state.selectedRequiredFile];
        this.setState({required_files: reqFiles, selectedRequiredFile: ""});
    }

    addRequiredFile(e) {
        e.preventDefault(e);
        let fileName = e.target.file_name.value
        let reqFiles = JSON.parse(JSON.stringify(this.state.required_files))
        reqFiles.elements[fileName] = {}
        this.setState({required_files: reqFiles, showNewRequiredFileModal: false});
    }

    render() {
        let requiredFiles = []
        if (this.state.required_files !== null ) {
            Object.keys(this.state.required_files.elements).forEach((fileNameStr) => requiredFiles.push({"file_name": fileNameStr}));
        }
        return (
            <div>
                {this.isLoaded() && <Modal open={this.state.showNewRequiredFileModal} center onClose={() => this.setState({showNewRequiredFileModal: false})}>
                    <br></br>
                    <div>
                        <Form onSubmit={this.addRequiredFile}>
                            <Form.Row>
                                <Form.Group style={{width: 280, margin: 5}} controlId="file_name">
                                    <Form.Label>File Name:</Form.Label>
                                    <Form.Control placeholder="Enter Required File Name"/>
                                </Form.Group>
                            </Form.Row>
                            <Button style={{margin: 5}} variant="primary" type="submit">Add</Button>
                        </Form>
                    </div>
                </Modal>}
                {this.isLoaded() && <Modal open={this.state.showPollingModal} center onClose={this.onPollingModalClose}>
                    <br></br>
                    <div>
                        {this.state.showPollingSpinner && <Spinner animation="border" variant="primary"/>}
                        {this.state.showPollingResult && <div style={{maxWidth: 600, maxHeight: 600}}>
                            <BootstrapTable hover keyField="name1" data={this.state.pollingResultMatches} columns={this.mossMatchesColumns} pagination={paginationFactory({showTotal: true})}/>
                            <br></br>
                            <a href={this.state.pollingResultLink}>Raw</a>
                        </div>}
                        {this.state.showPollingError && <div style={{width: 250, height: 250}}>{"Error polling moss request. Status code is " + this.state.pollingErrStatusCode}</div>}
                    </div>
                </Modal>}
                {this.isLoaded() && <Modal open={this.state.showMossModal} center onClose={() => this.setState({showMossModal: false})}>
                        <br></br>
                        <div style={{maxWidth: 300, maxHeight: 400}}><Form onSubmit={this.createMossRequest}>
                        <div class="input-group"><Form.Row>
                                <Form.Group style={{width: 350, margin: 5}} controlId="language">
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
                                <Form.Group style={{width: 350, margin: 5}} controlId="sensitivity">
                                    <Form.Label>Sensitivity:</Form.Label>
                                    <Form.Control type="number" placeholder="1 min sensitivity, 1000 max"/>
                                </Form.Group>
                            </Form.Row>
                            <Form.Row>
                                <Form.Group style={{width: 350, margin: 5}} controlId="threshold">
                                    <Form.Label>Threshold:</Form.Label>
                                    <Form.Control type="number" placeholder="Similarity percentage threhsold (1-100%)"/>
                                </Form.Group>
                            </Form.Row>
                            <Form.Row>
                                <Form.Group style={{width: 350, margin: 5}} controlId="timeout">
                                    <Form.Label>Timeout:</Form.Label>
                                    <Form.Control type="number" placeholder="Exec timeout in seconds (>0)"/>
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
                        <div style={{maxHeight: 600, maxWidth: 600}}><TestsOfDef courseNumber={this.state.course_number} courseYear={this.state.course_year} assName={this.state.name} history={this.props.history}/></div>
                    </Modal>}
                {this.isLoaded && <Modal open={this.state.showAppealsModal} center onClose={() => this.setState({showAppealsModal: false})}>
                        <br></br>
                        <div style={{maxHeight: 600, maxWidth: 600}}><AppealsOfDef courseNumber={this.state.course_number} courseYear={this.state.course_year} assName={this.state.name} history={this.props.history}/></div>
                    </Modal>}    
                {this.isLoaded() && <Modal open={this.state.showDateModal} center onClose={() => this.setState({showDateModal: false})}>
                        <br></br>
                        <div style={{maxWidth: 350, maxHeight: 225}}><Form onSubmit={this.updateDate}>
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
                                {this.state.state === 0 && <Button onClick={this.publish} variant="primary">Publish</Button>}
                            </Col>
                        </div>
                    </Form.Row>
                    <Form.Row>
                        <Col md style={{margin: 5}}>
                            <Form.Group>
                                <Form.Label>Required Files:</Form.Label>
                                <Fragment>
                                    {requiredFiles.length > 0 && <BootstrapTable hover keyField="file_name" data={requiredFiles} columns={[{dataField: "file_name", text: "File Name",}]} pagination={paginationFactory({showTotal: true})} selectRow={this.selectRequiredFile}/>}
                                    {requiredFiles.length <= 0 && <div class="alert alert-info" role="alert">No Required Files Yet...</div>}
                                </Fragment>
                                <Button style={{margin: 3}} variant="primary" onClick={() => this.setState({showNewRequiredFileModal: true})}>Add</Button>
                                <Button style={{margin: 3}} variant="primary" disabled={this.state.selectedRequiredFile === ""} onClick={this.removeRequiredFile}>Remove</Button>
                            </Form.Group>
                        </Col>
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
                            <Col md style={{margin: 5}}>
                                <Button variant="primary" style={{margin: 5}} onClick={() => this.setState({showAppealsModal: true})}>Appeals</Button>
                            </Col>
                            {this.state.state === 1 && <Col md style={{margin: 5}}>
                                <Button variant="primary" style={{margin: 5}} onClick={() => this.setState({showMossModal: true})}>Copy Detection</Button>
                            </Col>}
                        </div>
                    </Form.Row>
                    <Form.Row>
                        <Col md style={{margin: 5}}>
                            <Form.Group>
                                <Form.Label>Files:</Form.Label>
                                <FormFiles allowModification={true} elementBucket="assignment_definitions" elementKey={this.state.course_number + "/" + this.state.course_year + "/" + this.state.name} files={this.state.files} history={this.props.history}/>
                            </Form.Group>
                        </Col>
                    </Form.Row>
                </Form>}
            </div>
        )
    }

}

const AlertNoInstances = () => <div className="alert alert-info" role="alert">No Instances Here...</div>;
const AlertNoTests = () => <div className="alert alert-info" role="alert">No Tests Here...</div>;
const AlertNoAppeals = () => <div className="alert alert-info" role="alert">No Appeals Here...</div>;

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
            selectedTest: null,
            showNewTestModal: false,
            newTestOsType: "linux",
            newTestArch: "amd64",
            newTestRunsOn: 0,
            task_id: "",
            showPollingModal: false,
            showPollingSpinner: false,
            showPollingResult: false,
            showPollingError: false,
            pollingResult: null,
            pollingErrStatusCode: 0,
            pollingInterval: 0
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
        this.onPollingModalClose = this.onPollingModalClose.bind(this);
        this.runOnDemand = this.runOnDemand.bind(this);
        this.checkAssignment = this.checkAssignment.bind(this);
    }

    onPollingModalClose() {
        clearInterval(this.state.pollingInterval)
        this.props.history.go(0);
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

    onTestSelected = (row, isSelect, rowIndex, e) => {
        this.setState({selectedTest: row.name});
    }

    deleteTest() {
        fetch(window.location.origin + "/api/tests/" + this.courseNumber + "/" + this.courseYear + "/" + this.assName + "/" + this.state.selectedTest,
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

    selectTest = {
        mode: "radio",
        clickToSelect: false,
        onSelect: this.onTestSelected
    }

    columns = [{
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

    runOnDemand() {
        fetch(window.location.origin + "/api/test_requests/single", {method: "POST", body: JSON.stringify({
            test: this.courseNumber + ":" + this.courseYear + ":" + this.assName + ":" + this.state.selectedTest,
            on_demand: true
        })}).then((resp) => {
            if (resp.status !== 202) {
                alert("error creating on demand test request. Status code is " + resp.status);
                this.props.history.go(0);
                return null;
            }
            return resp.json();
        }).then((data) => {
            if (data !== null) {
                this.setState({task_id: data.task_id}, () => this.setState({showPollingModal: true, showPollingSpinner: true, pollingInterval: setInterval(() => {
                    fetch(window.location.origin + "/api/test_requests/" + this.state.task_id).then((resp) => {
                        if (resp.status === 200) {
                            clearInterval(this.state.pollingInterval)
                            return resp.json();
                        } else if (resp.status !== 202) {
                            clearInterval(this.state.pollingInterval)
                            this.setState({pollingErrStatusCode: resp.status, showPollingSpinner: false, showPollingError: true});
                            return null;
                        }
                        return null;
                    }).then((data) => {
                        if (data !== null) {
                            this.setState({showPollingSpinner: false, showPollingResult: true, pollingResult: JSON.parse(data.payload)});
                        }
                    })
                }, 3000)}))
            }
        });
    }

    checkAssignment() {
        fetch(window.location.origin + "/api/test_requests/multi", {method: "POST", body: JSON.stringify({
            test: this.courseNumber + ":" + this.courseYear + ":" + this.assName + ":" + this.state.selectedTest,
        })}).then((resp) => {
            if (resp.status !== 202) {
                alert("error creating on demand test request. Status code is " + resp.status);
            } else {
                alert("test request submitted successfully. Grades will be updated for all instances of the assignment");
            }
            this.props.history.go(0);
        })
    }

    render() {
        return (
            <div>
                <Modal open={this.state.showPollingModal} center onClose={this.onPollingModalClose}>
                    <br></br>
                    <div>
                        {this.state.showPollingSpinner && <Spinner animation="border" variant="primary"/>}
                        {this.state.showPollingResult && <div style={{maxWidth: 600, maxHeight: 600}}>
                            <Form.Group>
                                <Form.Label>Output:</Form.Label>
                                <Form.Control as="textarea" type="text" disabled value={this.state.pollingResult.output}/>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Grade:</Form.Label>
                                <Form.Control disabled value={this.state.pollingResult.grade}/>
                            </Form.Group>
                        </div>}
                        {this.state.showPollingError && <div style={{width: 250, height: 250}}>{"Error polling test request. Status code is " + this.state.pollingErrStatusCode}</div>}
                    </div>
                </Modal>
                <Modal open={this.state.showNewTestModal} center onClose={() => this.setState({showNewTestModal: false})}>
                    <br></br>
                    <div style={{maxWidth: 500, maxHeight: 350}}><Form onSubmit={this.createTest}>
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
                                <Form.Control type="number" placeholder="Exec timeout in seconds (>0)"/>
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
                        <Button style={{margin: 5, height: 40, position: "absolute", right: 0, bottom: 0}} variant="primary" type="submit">Submit</Button></div>
                    </Form></div>
                </Modal>
                {this.isLoaded() && this.state.elements !== null && <div><br></br><BootstrapTable hover keyField="key" data={ this.state.elements } columns={ this.columns } selectRow={this.selectTest}/></div>}
                {this.isLoaded() && this.state.elements === null && <div><br></br><AlertNoTests/></div>}
                <br></br>
                {this.isLoaded() && <div className="input-group">
                    {this.state.after_id > 0 && <Button variant="primary" onClick={this.previousPage} style={{position: "absolute", left: 0}}>Previous</Button>}
                    {this.state.left_to_process && <Button variant="primary" onClick={this.nextPage} style={{position: "absolute", right: 0}}>Next</Button>}
                </div>}
                <br></br><br></br> 
                {this.isLoaded() && <div className="input-group">
                    {this.state.elements !== null && <Button disabled={this.state.selectedTest === null} style={{margin: 5}} onClick={this.deleteTest}>Delete</Button>}
                    {this.state.elements !== null && <Button disabled={this.state.selectedTest === null} style={{margin: 5}} onClick={this.runOnDemand}>Run On Demand</Button>}
                    {this.state.elements !== null && <Button disabled={this.state.selectedTest === null} style={{margin: 5}} onClick={this.checkAssignment}>Check Assignment</Button>}
                    <Button style={{margin: 5, position: "absolute", right: 0}} onClick={() => {this.setState({showNewTestModal: true})}}>New</Button>
                </div>}
            </div>
        )
    }

}

class AppealsOfDef extends Component {

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
        var url = window.location.origin + '/api/appeals/?limit='+ this.state.limit
        if (this.state.after_id > 0) {
          url = url + "&after_id=" + this.state.after_id
        }
        fetch(url, {method:'GET', 
        headers: {'X-Submit-Ass': this.courseNumber + ":" + this.courseYear + ":" + this.assName}})
        .then((response) => {
          if (response.status !== 200){
            alert("error fetching appeals for definition. Status code is " + response.status)  
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
                        alert("invalid assignment definition key returned from backend");
                        return;
                    }
                    data.elements[i]["user_name"] = splitted[3];
                }
                this.setState({elements:data.elements}, () => this.setState({isLoaded: true}))
            } else {
                this.setState({elements:data.elements}, () => this.setState({isLoaded: true}))
            }
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

    columns = [{
        dataField: "user_name",
        text: "User",
        formatter: (cell) => <a href={window.location.origin + "/appeals/" + this.courseNumber + "/" + this.courseYear + "/" + this.assName + "/" + cell}>{cell}</a>
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
        return (
            <div>
                {this.isLoaded() && this.state.elements !== null && <div><br></br><BootstrapTable hover keyField="assignment_instance" data={ this.state.elements } columns={ this.columns }/></div>}
                {this.isLoaded() && this.state.elements === null && <div><br></br><AlertNoAppeals/></div>}
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
