import React from "react";
import { Component } from "react";
import BootstrapTable from 'react-bootstrap-table-next';
import {getLoggedInUserName} from "../Utils/session";
import { Type } from 'react-bootstrap-table2-editor';


export default class AssignmentsList extends Component {
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
//http://localhost:8080/assignment_instances/1/2021/ass4/nikita

    goToBackEnd() {
        var url = window.location.origin + '/api/assignment_instances/?limit='+ this.state.limit
        if (this.state.after_id > 0) {
          url = url + "&after_id=" + this.state.after_id
        }
        console.log(url)
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
          this.setState({elements:data.elements}, () => {
              console.log(this.state.elements)
          });
        });
    }

    componentDidMount() {
      this.props.navbar(true);
      this.goToBackEnd();
    }

    columns = [{
        dataField: 'assignment_def',
        text: 'Assignment name',
      }, {
        dataField: 'due_by',
        text: 'Due by',
        formatter: (cell) => {
          let dateObj = cell;
          if (typeof cell !== 'object') {
            dateObj = new Date(cell);
          } return `${('0' + dateObj.getDate()).slice(-2)}/${('0' + (dateObj.getMonth() + 1)).slice(-2)}/${dateObj.getFullYear()}`;
          }, editor: {
            type: Type.DATE
          }
        
      }, {
        dataField: 'state',
        text: 'State'
      },
      {
        dataField: 'grade',
        text: 'Grade'
      },
      {
        dataField: 'copy',
        text: 'Detected as copy?'
      }
    ];
    render(){
      return (
    <div className="UsersList">
    <p className="Table-header"></p>
     
    {this.state.elements !== null && <BootstrapTable hover keyField='assignment_def' data={ this.state.elements } columns={ this.columns } />}
    </div>
      );
      }
  
   }