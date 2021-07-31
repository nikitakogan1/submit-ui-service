import { Component } from "react";
import BootstrapTable from 'react-bootstrap-table-next';
import Button from "react-bootstrap/Button";
import {getLoggedInUserName} from "../Utils/session";

export default class TestsList extends Component {

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

    parseState(state){
        if (state === 0){
            return "Drafted"
        } else if (state === 1){
            return "In Review"
        } else {
            return "Published"
        }
    }

    columns = [
    {
        dataField: 'assignment_def',
        text: 'Assignment',
        formatter: (cell, row) => <a href={"/tests/" + cell.replaceAll(":","/") + "/" + row.name}> {cell.replaceAll(":","/")} </a>,
    },
    {
        dataField: 'name',
        text: 'Name',
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
        dataField: 'state',
        text: 'State',
        formatter: (cell, row) => <h10>{this.parseState(cell)}</h10>

      },
    ];

    componentDidMount() {
        this.props.navbar(true);
        this.goToBackEnd();
    }

    goToBackEnd() {
        var url = window.location.origin + '/api/tests/?limit='+ this.state.limit
        if (this.state.after_id > 0) {
          url = url + "&after_id=" + this.state.after_id
        }
        fetch(url, {method:'GET'})
        .then((response) => {
          if (response.status === 403){
            this.props.history.push("/unauthorized");
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
            { this.state.elements !== null && this.state.elements.length > 0 && <BootstrapTable hover keyField='assignment_def' data={ this.state.elements } columns={ this.columns } /> }
            {this.state.after_id > 0 && <Button variant="primary" id= "TestsPrevPage" onClick={this.previousPage}>Previons page</Button>}
            {this.state.left_to_process === true && <Button variant="primary" id= "TestsNextPage" onClick={this.nextPage}>Next page</Button>}
            </div>
        )
    }





}