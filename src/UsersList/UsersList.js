import React from "react";
import { Component } from "react";
import { withRouter } from "react-router-dom";
import { Table } from 'semantic-ui-react';
//import "./UsersList.css"
//import '../../node_modules/bootstrap/dist/css/bootstrap.min.css'; 
import BootstrapTable from 'react-bootstrap-table-next';

class UsersList extends Component {
    constructor(props) {
      super(props);
      this.state = {elements: [
        {user_name:null,first_name:null,last_name:null}
      ]
    };
    this.componentDidMount=this.componentDidMount.bind(this);
    }
    
    getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    }

    setCookie(name,value,days) {
      var expires = "";
      if (days) {
          var date = new Date();
          date.setTime(date.getTime() + (days*24*60*60*1000));
          expires = "; expires=" + date.toUTCString();
      }
      document.cookie = name + "=" + (value || "")  + expires + "; path=/";
  }

    componentDidMount() {
      fetch('http://localhost:3000/api/users/', {method:'GET', 
      headers: {'Authorization': 'Basic ' + btoa('username:password')}})
      .then((response) => {
        return response.json()
      })
      .then (data => {
        this.setState(data, () => {
            console.log(this.state.elements)
        });
      });
    }
    columns = [{
        dataField: 'user_name',
        text: 'User name'
      }, {
        dataField: 'first_name',
        text: 'First name'
      }, {
        dataField: 'last_name',
        text: 'Last name'
      }];
    render(){
      return (
        <Table >
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>User name</Table.HeaderCell>
            <Table.HeaderCell>First name</Table.HeaderCell>
            <Table.HeaderCell>Last name</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
  
        <Table.Body>
          {this.state.elements.map(user => {
            return (
              <Table.Row key={user.number}>
                <Table.Cell>{user.user_name}</Table.Cell>
                <Table.Cell>
                  {user.first_name}
                </Table.Cell>
                <Table.Cell>
                  {user.last_name}
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    
    // <div className="UsersList">
    // <p className="Table-header"></p>
     
    // <BootstrapTable keyField='id' data={ this.state.elements } columns={ this.columns } />
    // </div>
      );
      }
  
   }
  export default withRouter(UsersList);
