import React, { Component } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import "./login.css";
import { withRouter } from 'react-router-dom';
import {getCookie, setCookie } from  "../Utils/session";

class Login extends Component {
    okToServe = false;  
    profile = {
        "user_name": "",
        "roles": [],
        "staff_courses": null,
        "student_courses": null
    };

  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      alertFailure:false,
      alertFailureBackEnd: false
    };
    this.handleSubmit=this.handleSubmit.bind(this);
    this.componentDidMount=this.componentDidMount.bind(this);
  }

  validateForm() {
    return this.state.username.length > 0 && this.state.password.length > 0;
  }

    componentDidMount(){
        this.props.navbar(false)
        var state_cookie = getCookie("submit-last-server-state")
        if (state_cookie !== undefined && state_cookie !== null && state_cookie !== "") {
          this.props.history.push({
            pathname: "/users/" + JSON.parse(state_cookie).user_name.toString(),
            state: state_cookie
          });
        }
    }
  
  async handleSubmit(event) {
    event.preventDefault();
    await fetch(window.location.origin + '/api/', {method:'GET', 
    headers: {'Authorization': 'Basic ' + btoa(this.state.username + ":" + this.state.password)}})
    .then((response) => {
        if (response.ok) {
            this.okToServe = true
            var jsonResp = response.json()
        } else if (response.status === 401) {
          this.setState({alertFailure: true})
          return
        } else {
          this.setState({alertFailureBackEnd: true})
        }
        return jsonResp
    })
    .then (data => {
      setCookie("submit-last-server-state", JSON.stringify(data))
      this.profile = data
    });
    if (this.okToServe) {
      this.props.history.push({
        pathname: decodeURIComponent("/users/" + this.profile.user_name),
        state: JSON.stringify(this.profile),
      });
    }
  }


  render () {
    return <div className="Login">
    <h1 className='mb-3'>Please log in to submit</h1>
    <Form onSubmit={this.handleSubmit}>
      <Form.Group size="lg" controlId="username">
        <Form.Label>Username</Form.Label>
        <Form.Control
          autoFocus
          type="text"
          value={this.username}
          onChange={(e) =>  this.setState({ username: e.target.value })}
        />
      </Form.Group>
      <Form.Group size="lg" controlId="password">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          value={this.password}
          onChange={(e) => this.setState({ password: e.target.value })}
        />
      </Form.Group>
      <Button id="login_bot" block size="lg" type="submit" disabled={!this.validateForm()}>
        Login
      </Button>
      {this.state.alertFailure && <AlertCredsFailure></AlertCredsFailure>}
      {this.state.alertFailureBackEnd && <AlertFailureBackEnd></AlertFailureBackEnd>}
    </Form>
  </div>
  }
}


const AlertFailureBackEnd = () => {
  return (
    <div class="alert alert-danger" role="alert">
    Failure in the backend. please contact the site owner.
    </div>
  )
}

const  AlertCredsFailure = () => {
  return (
   <div class="alert alert-danger" role="alert">
     Invalid username/password, please try again.
   </div>
  )
}

export default withRouter(Login)