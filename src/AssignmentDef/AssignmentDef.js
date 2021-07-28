import React from "react";
import { Component } from "react";
import BootstrapTable from 'react-bootstrap-table-next';
import {getLoggedInUserName} from "../Utils/session";


export default class AssignmentDefList extends Component {
    constructor(props) {
      super(props);
      this.state = {left_to_process:false,limit:5, after_id:0, elements: [],
    };
    this.componentDidMount=this.componentDidMount.bind(this);
    this.previousPage=this.previousPage.bind(this);
    this.nextPage=this.nextPage.bind(this);
    this.goToBackEnd=this.goToBackEnd.bind(this);
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

    goToBackEnd() {
        var url = window.location.origin + '/api/assignment_definitions/?limit='+ this.state.limit
        if (this.state.after_id > 0) {
          url = url + "&after_id=" + this.state.after_id
        }
        fetch(url, {method:'GET', 
        headers: {'X-Submit-User': getLoggedInUserName()}})
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

    componentDidMount() {
      this.props.navbar(true);
      this.goToBackEnd();
    }

    columns = [{
        dataField: 'name',
        formatter: (cell, row) => <a href={"/assignment_definitions/" + cell.replaceAll(":","/")}> {cell} </a>,
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