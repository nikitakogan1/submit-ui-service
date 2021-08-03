
import React from "react";
import { Component } from "react";
import { withRouter } from "react-router-dom";
//import "./Messages.css"
import BootstrapTable from 'react-bootstrap-table-next';
import Button from "react-bootstrap/Button"
import {getLoggedInUserName} from "../Utils/session";

class Messages extends Component {

  constructor(props) {
    super(props);
    this.state = {left_to_process:false,limit:5, after_id:0, elements: []
  };
  this.componentDidMount=this.componentDidMount.bind(this);
  this.goToBackEnd=this.goToBackEnd.bind(this);
  this.nextPage=this.nextPage.bind(this);
  this.previousPage=this.previousPage.bind(this);
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
    dataField: 'from',
    text: 'From',
  }, {
    dataField: 'text',
    text: 'Message content',
  },
  {
    dataField: 'updated_on',
    text: 'Sent on',
    formatter: (cell, row) => <h10>{new Date(cell).toString()}</h10>
  }
];


    componentDidMount() {
      this.props.navbar(true);
      this.goToBackEnd();
    }

    goToBackEnd() {
      var header = {'X-Submit-User': getLoggedInUserName() }
      var url = window.location.origin + '/api/messages/users/' + getLoggedInUserName() + '?limit='+ this.state.limit
      if (this.state.after_id > 0) {
        url = url + "&after_id=" + this.state.after_id
      }
      fetch(url, {method:'GET', 
      headers: header})
      .then((response) => {
        if (response.headers.has("X-Elements-Left-To-Process")){
            this.setState({left_to_process:true})
        } else {
            this.setState({left_to_process:false})
        }
        return response.json()
      })
      .then (data => {
          console.log(data)
        this.setState({elements:data.elements});
      });
    }

    render(){
        console.log(this.state.elements)
      return (

      <React.Fragment>
        {(this.state.elements === null || this.state.elements === []) && <AlertNoMessages></AlertNoMessages>}
     {this.state.elements  !== null && <BootstrapTable hover keyField='updated_on' data={ this.state.elements } columns={ this.columns } />} 
            {this.state.after_id > 0 && <Button  variant="primary" id= "MessagePrevPage" onClick={this.previousPage}>
                Previons page
            </Button>}
            {this.state.left_to_process === true && <Button  variant="primary" id= "MessageNextPage" onClick={this.nextPage}>
                Next page
            </Button>}
      </React.Fragment>
      );
      }
  
   }

   const AlertNoMessages = () => <div class="alert alert-info" role="alert">No Messages Yet...</div>;


  export default withRouter(Messages);


 

















