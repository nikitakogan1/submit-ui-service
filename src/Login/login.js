import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import "./login.css";
import { useHistory } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const profile = {
    "user_name": "",
    "roles": [],
    "staff_courses": null,
    "student_courses": null
}
  const history = useHistory();
  function validateForm() {
    return username.length > 0 && password.length > 0;
  }

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  
  function handleSubmit(event) {
    event.preventDefault();
    fetch('http://localhost:3000/api/', {method:'GET', 
    headers: {'Authorization': 'Basic ' + btoa(username + ":" + password)}})
    .then((response) => {
        if (response.ok) {
            var cookie = getCookie("submit_last_visited_path")
            if (cookie != null) {
                history.push(decodeURIComponent(cookie.toString()))
            } else {
                history.push(decodeURIComponent("/courses"))
            }
        } else {
            alert("invalid credentials")
        }
        return response.json()
    })
    .then (data => {
      console.log(data);
    });
    console.log(document.cookie)
  }

  return (
    <div className="Login">
      <Form onSubmit={handleSubmit}>
        <Form.Group size="lg" controlId="username">
          <Form.Label>Username</Form.Label>
          <Form.Control
            autoFocus
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Form.Group>
        <Form.Group size="lg" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <Button block size="lg" type="submit" disabled={!validateForm()}>
          Login
        </Button>
      </Form>
    </div>
  );
}