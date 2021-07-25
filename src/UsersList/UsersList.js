import React from "react";
import { Component } from "react";
import { withRouter } from "react-router-dom";
import Col from "react-bootstrap/Col"
import Form from "react-bootstrap/Form"
import Modal from "react-bootstrap/Modal"
import Button from "react-bootstrap/Button"
import  { useState } from 'react';
import "./UserList.css"
//import '../../node_modules/bootstrap/dist/css/bootstrap.min.css'; 
import BootstrapTable from 'react-bootstrap-table-next';

class UsersList extends Component {
  usersSelectedToDelete=[]
    constructor(props) {
      super(props);
      this.state = {left_to_process:false,limit:1, after_id:0, elements: [
        {user_name:null,first_name:null,last_name:null}
      ],
    };
    this.componentDidMount=this.componentDidMount.bind(this);
    this.previousPage=this.previousPage.bind(this);
    this.nextPage=this.nextPage.bind(this);
    this.goToBackEnd=this.goToBackEnd.bind(this);
    }

    deleteSelectedUsers = () => {
        this.usersSelectedToDelete.forEach( (username) => {
            fetch(window.location.origin  +  'api/users/' + username, {method:'DELETE', 
            headers: {'Authorization': 'Basic ' + btoa('username:password')}})
            .then((response) => {
            if (!response.ok){
                alert("balagan")
            }
            return response.json()
            });
        })
        this.props.history.go(0)
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
        var url = window.location.origin + '/api/users/?limit='+ this.state.limit
        if (this.state.after_id > 0) {
          url = url + "&after_id=" + this.state.after_id
        }
        console.log(url)
        fetch(url, {method:'GET', 
        headers: {'Authorization': 'Basic ' + btoa('username:password')}})
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

    selectRow = {
        mode: "checkbox",
        clickToSelect: false,
        classes: "selection-row",
        onSelect: (props) => {
            if (this.usersSelectedToDelete.includes(props.user_name)){
                this.usersSelectedToDelete = this.usersSelectedToDelete.filter(function(item) {
                    return item !== props.user_name
                }) 
            } else {
                this.usersSelectedToDelete.push(props.user_name)
            }
            console.log("final list to delete", this.usersSelectedToDelete)
          }
      };

    columns = [{
        dataField: 'user_name',
        text: 'User name',
        formatter: (cell, row) => <a href={"/users/" + cell}> {cell} </a>,
      }, {
        dataField: 'first_name',
        text: 'First name'
      }, {
        dataField: 'last_name',
        text: 'Last name'
      }];
    render(){
      return (
    <div className="UsersList">
    <p className="Table-header"></p>
     
    <BootstrapTable selectRow={this.selectRow} hover keyField='user_name' data={ this.state.elements } columns={ this.columns } />
    <AddUserModal history={this.props.history}></AddUserModal>
    <Button  variant="primary" id= "deleteUserBut" onClick={this.deleteSelectedUsers}>
        Delete Selected users
    </Button>
    {this.state.after_id > 0 && <Button  variant="primary" id= "UsersPrevPage" onClick={this.previousPage}>
        Previons page
    </Button>}
    {this.state.left_to_process === true && <Button  variant="primary" id= "UsersNextPage" onClick={this.nextPage}>
        Next page
    </Button>}
    </div>
      );
      }
  
   }
   


  export function AddUserModal(props) {
    const [show, setShow] = useState(false);
  
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);


    const updateDetails = (event) => {
        event.preventDefault(event);
        console.log(event.target.user_name.value)
        var body = {"users":[{"user_name":event.target.user_name.value, "email": event.target.email.value ,"password":event.target.password.value, "last_name": event.target.last_name.value, "first_name": event.target.first_name.value ,"roles":{"elements":{"std_user":{}}},"courses_as_student":{"elements":{}},"courses_as_staff":{"elements":{}}}]}
        console.log(body)
        fetch(window.location.origin + '/api/users/', {method:'POST', 
        body: JSON.stringify(body), headers: {'Authorization': 'Basic ' + btoa('username:password')}})
        .then((response) => {
          return response.json()
        });
        handleClose()
        props.history.go(0)
    }

    return (
      <>
        <Button id="addUser" variant="primary" onClick={handleShow}>
          Add user
        </Button>
  
        <Modal id="addUserModal" show={show} onHide={handleClose} animation={false}>
            <Modal.Title id="registerUserText">Register user</Modal.Title>
          <Modal.Body>

          <Form  id="addUserForm" onSubmit={updateDetails}>
            <Form.Row>
                <Form.Group as={Col} controlId="user_name">
                <Form.Label>User name:</Form.Label>
                <Form.Control type="user name" placeholder="Enter user name" />
                </Form.Group>
            </Form.Row>

            <Form.Group controlId="first_name"> 
                <Form.Label>First name: </Form.Label>
                <Form.Control placeholder="Enter first name"  />
            </Form.Group>

            <Form.Group controlId="last_name" >
                <Form.Label>Last name: </Form.Label>
                <Form.Control placeholder="Enter last name"/>
            </Form.Group>

            <Form.Group controlId="password" placeholder="Enter password">
                <Form.Label>Password: </Form.Label>
                <Form.Control placeholder="Enter password"/>
            </Form.Group>

            <Form.Row>
                <Form.Group controlId="email" placeholder="Enter email">
                <Form.Label>Email: </Form.Label>
                <Form.Control placeholder="Enter email"/>
            </Form.Group>
            </Form.Row>
            <Button id="submitNewUser" variant="primary" type="submit">
                Submit
            </Button>
            <Button id="closeSubmitNewUser" variant="primary" onClick={handleClose}>
              Close
            </Button> 
            </Form>
          </Modal.Body>
        </Modal>
      </>
    );
  }

  export default withRouter(UsersList);
