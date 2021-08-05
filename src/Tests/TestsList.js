import { Component } from "react";
import BootstrapTable from 'react-bootstrap-table-next';
import Button from "react-bootstrap/Button";
import {parseTestState} from "../Utils/utils"

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



    columns = [
      {
        dataField: 'name',
        text: 'Name',
        formatter: (cell, row) => <a href={"/tests/" + row.assignment_def.replaceAll(":","/") + "/" + cell}> {cell} </a>
    }, 
    {
        dataField: 'course_number',
        text: 'Course number',
        formatter: (cell, row) => <a href={"/courses/" + row.course_number + "/" + row.course_year}> {cell} </a>
    },
    {
      dataField: 'course_year',
      text: 'Course year',
    },
    {
      dataField: 'ass_name',
      text: 'Assignment',
      formatter: (cell, row) => <a href={"/assignment_definitions/" + row.assignment_def.replaceAll(":","/")}> {cell} </a>
    },
      {
        dataField: 'command',
        text: 'Command',
      },
    {
        dataField: 'created_on',
        text: 'creation date',
        formatter: (cell) => <h10>{new Date(cell).toString()}</h10>
    },
      {
        dataField: 'state',
        text: 'State',
        formatter: (cell) => <h10>{parseTestState(cell)}</h10>

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
          if (data !== null) {
            for (let i = 0; i < data.elements.length; i++) {
              let splitted = data.elements[i].assignment_def.split(":");
              if (splitted.length !== 3) {
                alert("invalid assignment definition key '" + data.elements[i].assignment_def + "' returned from backend");
                this.props.history.push("/internal-error");
                this.props.history.go(0);
              }
              data.elements[i]["course_number"] = splitted[0];
              data.elements[i]["course_year"] = splitted[1];
              data.elements[i]["ass_name"] = splitted[2];
            }
          }
          this.setState({elements:data.elements});
        });
    }

    render() {
        return (
            <div>
            {(this.state.elements === undefined || this.state.elements === null || this.state.elements.length === 0) && <AlertNoTests></AlertNoTests>}
            { this.state.elements !== null && this.state.elements.length > 0 && <BootstrapTable hover keyField='assignment_def' data={ this.state.elements } columns={ this.columns } /> }
            {this.state.after_id > 0 && <Button variant="primary" id= "TestsPrevPage" onClick={this.previousPage}>Previons page</Button>}
            {this.state.left_to_process === true && <Button variant="primary" id= "TestsNextPage" onClick={this.nextPage}>Next page</Button>}
            </div>
        )
    }

}
const AlertNoTests = () => <div class="alert alert-info" role="alert">No Tests Yet...</div>;



