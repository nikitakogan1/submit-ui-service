import { Component } from "react";
import BootstrapTable from 'react-bootstrap-table-next';
import Button from "react-bootstrap/Button";
import parseStatus from "../Utils/utils"
import "./Task.css"

export default class TasksList extends Component {

    constructor(props){
        super(props);
        this.state = {
            left_to_process: false,
            after_id: 0,
            limit: 5,
            elements: null
        }
        this.goToBackEnd=this.goToBackEnd.bind(this);
        this.componentDidMount=this.componentDidMount.bind(this);
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
        dataField: 'agent',
        text: 'Agent',
        formatter: (cell) => <a href={"/agents/" + cell}> {cell} </a>,
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

    componentDidMount() {
        this.props.navbar(true);
        this.goToBackEnd();
    }

    goToBackEnd() {
        var url = window.location.origin + '/api/tasks/?limit='+ this.state.limit
        if (this.state.after_id > 0) {
          url = url + "&after_id=" + this.state.after_id
        }
        fetch(url, {method:'GET'})
        .then((response) => {
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
          if (response.headers.has("X-Elements-Left-To-Process")){
              this.setState({left_to_process:true})
          } else {
              this.setState({left_to_process:false})
          }
          return response.json()
        })
        .then (data => {
          this.setState({elements:data.elements});
        });
    }

    render() {
        return (
            <div>
            {(this.state.elements === undefined || this.state.elements === null || this.state.elements.length === 0) && <AlertNoTasks></AlertNoTasks>}
            { this.state.elements !== null && this.state.elements.length > 0 && <BootstrapTable hover keyField='id' data={ this.state.elements } columns={ this.columns } /> }
            {this.state.after_id > 0 && <Button variant="primary" id= "TasksPrevPage" onClick={this.previousPage}>Previons page</Button>}
            {this.state.left_to_process === true && <Button variant="primary" id= "TasksNextPage" onClick={this.nextPage}>Next page</Button>}
            </div>
        )
    }

}

const AlertNoTasks = () => <div class="alert alert-info" role="alert">No Tasks Yet...</div>;
