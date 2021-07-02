import React, { Component } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import "./login.css";
import { withRouter } from 'react-router-dom';

class Login extends Component {
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
      password: ""
    };
    this.handleSubmit=this.handleSubmit.bind(this);
  }

  validateForm() {
    return this.state.username.length > 0 && this.state.password.length > 0;
  }

  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  
  async handleSubmit(event) {
    event.preventDefault();
    await fetch('http://localhost:3000/api/', {method:'GET', 
    headers: {'Authorization': 'Basic ' + btoa(this.state.username + ":" + this.state.password)}})
    .then((response) => {
        if (response.ok) {
            var jsonResp = response.json()
        } else {
            alert("invalid credentials")
            return
        }
        return jsonResp
    })
    .then (data => {
      this.profile = data
    });
    var cookie = this.getCookie("submit_last_visited_path")
    if (cookie != null) {
         this.props.history.push({
             pathname: decodeURIComponent(cookie.toString()),
             state: JSON.stringify(this.profile),
         });
     } else {
         this.props.history.push({
             pathname: decodeURIComponent("/courses"),
             state: JSON.stringify(this.profile),
         });
     }
  }


  render () {
    return <div className="Login">
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
      <Button block size="lg" type="submit" disabled={!this.validateForm()}>
        Login
      </Button>
    </Form>
  </div>
  }
}

export default withRouter(Login)