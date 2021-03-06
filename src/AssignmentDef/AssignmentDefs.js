import React from "react";
import { Component } from "react";
import BootstrapTable from 'react-bootstrap-table-next';
import {getLoggedInUserName} from "../Utils/session";
import Button from "react-bootstrap/Button"

export default class AssignmentDefList extends Component {
    constructor(props) {
      super(props);
      this.state = {assignmentDefToDelete: null, left_to_process:false,limit:5, after_id:0, elements: [],
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

    deleteSelectedAss = () => {
      fetch(window.location.origin  +  '/api' + this.state.assignmentDefToDelete , {method:'DELETE'})
      .then((response) => {
      if (!response.ok){
          alert("failed to delete the assignment definition")
      }
      return response.json()
      }).then(() => {
        this.props.history.go(0)
      });

  }

  selectRow = {
    mode: "radio",
    clickToSelect: false,
    hideSelectAll: true,
    classes: "selection-row",
    onSelect: (props) => {
        this.setState({assignmentDefToDelete: "/assignment_definitions/" + props.course.split(":")[0] + "/" +  props.course.split(":")[1] + "/" + props.name})
      }
  };

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
          var toRet=[]
          if (data.elements !== undefined && data.elements !== null && data.elements !== []) {
            data.elements.forEach((element) => {
              element.id=element.course + ":" + element.name
              toRet.push(element)
            })
          }
          this.setState({elements:data.elements});
        });
    }

    componentDidMount() {
      this.props.navbar(true);
      this.goToBackEnd();
    }



    
    columns = [{
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
        text: 'Course numer',
        formatter: (cell, row) => <a href={"/courses/" + cell.split(":")[0] + "/" +  cell.split(":")[1]}> {cell.split(":")[0]} </a>,
      },
      {
        dataField: 'course_year',
        text: 'Course year',
        formatter: (cell, row) => <h10>{row.course.split(":")[1]} </h10>
      },
    ];
    render(){
      return (
    <div className="AssignmentList">
    <p className="Table-header"></p>
    {(this.state.elements === undefined || this.state.elements === null || this.state.elements === []) && <AlertNoAssignments></AlertNoAssignments>}

    {this.state.elements !== undefined && this.state.elements !== null && this.state.elements.length !== 0 && <BootstrapTable  selectRow={this.selectRow} hover keyField='id' data={ this.state.elements } columns={ this.columns } />}
    {this.state.elements !== undefined && this.state.elements !== null && this.state.elements.length !== 0 &&  <Button disabled={this.state.assignmentDefToDelete === null} variant="primary" id= "deleteAssDefsBut" onClick={this.deleteSelectedAss}>Delete</Button>}
    </div>
      );
      }
  
   }
   const AlertNoAssignments= () => <div class="alert alert-info" role="alert">No Assignments Yet...</div>;
