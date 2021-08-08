import {Component, Fragment} from "react";
import ReactJson from "react-json-view";
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import Button from "react-bootstrap/Button";
import BootstrapTable from 'react-bootstrap-table-next';
import parseStatus from "../Utils/utils";

export default class Agent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            data: null,
            pollingInterval: 0,
            showTasksModal: false
        };
        this.isLoaded = this.isLoaded.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentWillUnmount = this.componentWillUnmount.bind(this);
    }

    componentWillUnmount() {
        clearInterval(this.state.pollingInterval);
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
        }).then(data => this.setState({data: data}, () => this.setState({isLoaded: true, pollingInterval: setInterval(() => {
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
            }).then(data => this.setState({data: data}));
        }, 3000)})));
    }

    isLoaded() {
        return this.state.isLoaded;
    }

    render() {
        return (
            <Fragment>
                {this.isLoaded() && <Modal open={this.state.showTasksModal} onClose={() => this.setState({showTasksModal: false})}>
                    <br></br>
                    <div><TasksOfAgent agent={this.state.data.id} history={this.props.history}/></div>
                </Modal>}
                {this.isLoaded() && <div>
                    <ReactJson src={this.state.data}/>
                    <Button variant="primary" onClick={() => this.setState({showTasksModal: true})}>Tasks</Button>
                </div>}
            </Fragment>
        )
    }

}

const AlertNoTasks = () => <div className="alert alert-info" role="alert">No Tasks Here...</div>;

class TasksOfAgent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            left_to_process: false,
            limit: 5,
            after_id: 0,
            elements: null
        }
        this.agent = props.agent;
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
        var url = window.location.origin + '/api/tasks/?limit=' + this.state.limit
        if (this.state.after_id > 0) {
          url = url + "&after_id=" + this.state.after_id
        }
        fetch(url, {method:'GET', 
        headers: {'X-Submit-Agent': this.agent}}).then((response) => {
          if (response.status !== 200){
            alert("error fetching tasks of agent. Status code is " + response.status)  
            this.props.history.push("/internal-error");
            this.props.history.go(0);
            return null;
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

    columns = [
        {
            dataField: 'id',
            text: 'Task ID',
            formatter: (cell, row) => <a href={"/tasks/" + cell}> {cell} </a>,
        },
          {
            dataField: 'command',
            text: 'Command',
          },
        {
            dataField: 'created_on',
            text: 'creation date',
            formatter: (cell, row) => <h10>{new Date(cell).toString()}</h10>
        },
          {
            dataField: 'status',
            text: 'Status',
            formatter: (cell, row) => <h10>{parseStatus(cell)}</h10>
          },
          {
            dataField: 'response_handler',
            text: 'Task type',
          },
          {
            dataField: 'description',
            text: 'Description',
          },
        ];

    render() {
        return (<div>
            {this.isLoaded() && this.state.elements !== null && <div><br></br><BootstrapTable hover keyField='id' data={ this.state.elements } columns={ this.columns } /></div>}
            {this.isLoaded() && this.state.elements === null && <div><br></br><AlertNoTasks/></div>}
            <br></br>
            {this.isLoaded() && <div className="input-group">
                {this.state.after_id > 0 && <Button variant="primary" onClick={this.previousPage} style={{position: "absolute", left: 0}}>Previous</Button>}
                {this.state.left_to_process && <Button variant="primary" onClick={this.nextPage} style={{position: "absolute", right: 0}}>Next</Button>}
            </div>}
        </div>)
    }

}
