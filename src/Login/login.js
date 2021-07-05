import React, { Component } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import "./login.css";
import { withRouter } from 'react-router-dom';

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
      password: ""
    };
    this.handleSubmit=this.handleSubmit.bind(this);
    this.componentDidMount=this.componentDidMount.bind(this);
  }

  validateForm() {
    return this.state.username.length > 0 && this.state.password.length > 0;
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

    componentDidMount(){
        var state_cookie = this.getCookie("submit-last-server-state")
        var auth_cookie = this.getCookie("submit-server-cookie")
        var last_visited_cookie = this.getCookie("submit-last-visited-path")
        if (auth_cookie !== undefined && state_cookie !== undefined) {
          if (last_visited_cookie == null){
            this.setCookie("submit-last-visited-path", "/users" + "/" + state_cookie.user_name.toString(), 0.0034)
          }
            console.log("using the cookie")
            this.props.history.push({
                pathname: decodeURIComponent(this.getCookie("submit-last-visited-path")),
                state: state_cookie
            });
        }
    }
  
  async handleSubmit(event) {
    var last_visited_cookie = this.getCookie("submit-last-visited-path")
    event.preventDefault();
    await fetch('http://localhost:3000/api/', {method:'GET', 
    headers: {'Authorization': 'Basic ' + btoa(this.state.username + ":" + this.state.password)}})
    .then((response) => {
        if (response.ok) {
            this.okToServe = true
            var jsonResp = response.json()
        } else {
            alert("invalid credentials")
            return
        }
        return jsonResp
    })
    .then (data => {
      this.setCookie("submit-last-server-state", JSON.stringify(data), 0.0034)
      this.profile = data
    });
    if (this.okToServe) {
        if (last_visited_cookie != null) {
            this.props.history.push({
                pathname: decodeURIComponent(last_visited_cookie.toString()),
                state: JSON.stringify(this.profile),
            });
       } else {
            this.props.history.push({
                pathname: decodeURIComponent("/courses"),
                state: JSON.stringify(this.profile),
            });
        }
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