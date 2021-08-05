import React from "react";
import { Component } from "react";
import BootstrapTable from 'react-bootstrap-table-next';

export default class AppealList extends Component {
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
        var url = window.location.origin + '/api/appeals/?limit='+ this.state.limit
        if (this.state.after_id > 0) {
          url = url + "&after_id=" + this.state.after_id
        }
        fetch(url, {method:'GET'}).then((response) => {
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
          if (data != null) {
            for (let i = 0; i < data.elements.length; i++) {
              let splitted = data.elements[i].assignment_instance.split(":");
              if (splitted.length !== 4) {
                alert("invalid assignment instane key '" + data.elements[i].assignment_instance + "' returned from backend");
                this.props.history.push("/internal-error");
                this.props.history.go(0);
              }
              data.elements[i]["course_number"] = splitted[0];
              data.elements[i]["course_year"] = splitted[1];
              data.elements[i]["ass_name"] = splitted[2];
              data.elements[i]["user_name"] = splitted[3];
            }
          }
          this.setState({elements:data.elements});
        });
    }

    componentDidMount() {
      this.props.navbar(true);
      this.goToBackEnd();
    }

    columns = [{
      dataField: "ass_name",
      text: "Assignment",
      formatter: (cell, row) => <a href={"/appeals/" + row.course_number + "/" + row.course_year + "/" + row.ass_name + "/" + row.user_name}>{cell}</a>
    },{
      dataField: "course_number",
      text: "Course number",
      formatter: (cell, row) => <a href={"/courses/" + row.course_number + "/" + row.course_year}>{cell}</a>
    },{
      dataField: "course_year",
      text: "Course year"
    },{
      dataField: "user_name",
      text: "Student",
      formatter: (cell) => <a href={"/users/" + cell}>{cell}</a>
    },{
      dataField: "state",
      text: "State",
      formatter: (cell) => <h10>{cell === 0 ? "Open" : "Closed"}</h10>
    }]

    render(){
      return (
    <div className="UsersList">
    <p className="Table-header"></p>
     
    {this.state.elements !== null && <BootstrapTable hover keyField='assignment_def' data={ this.state.elements } columns={ this.columns } />}
    </div>
      );
      }
  
   }