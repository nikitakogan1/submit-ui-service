import React, { useEffect } from "react";
import { Component } from "react";
import "./User.css"
import Form from "react-bootstrap/Form"

import FormGroup from "react-bootstrap/FormGroup"

export default class AdminUserRoles extends Component {
    constructor(props){
      super(props)
      this.state = {
        isAdmin: false, isSec: false, isStdUsr: false, isAgent: false
      }
      this.componentDidMount = this.componentDidMount.bind(this)
    }
  
  
    componentDidMount() {
      var role = this.props.role
      console.log("the role is",role)
      if (role === "Admin"){
        this.setState({isAdmin : true})
      }
      if (role === "Secretary"){
        this.setState({isSec : true})
      }
      if (role === "User"){
        this.setState({isStdUsr : true})
      }
      if (role === "Agent"){
        this.setState({isAgent : true})
      }
    }
    render () {
      return <div className="RolesRadio">
        <fieldset>
        <FormGroup>
        <Form.Check
        type="radio"
        label={`Admin`}
        id={`Admin`}
        onChange={e => {
          this.setState({isAdmin : e.currentTarget.checked})
          this.setState({isSec : !e.currentTarget.checked})
          this.setState({isAgent : !e.currentTarget.checked})
          this.setState({isStdUsr : !e.currentTarget.checked})
  
        }
        }
        checked={this.state.isAdmin === true}
        />
        <Form.Check
        type="radio"
        label={`Agent`}
        id={`Agent`}
        checked={this.state.isAgent === true}
        onChange={e =>{
          this.setState({isAdmin : !e.currentTarget.checked})
          this.setState({isSec : !e.currentTarget.checked})
          this.setState({isAgent : e.currentTarget.checked})
          this.setState({isStdUsr : !e.currentTarget.checked})
        }
        }
        />
        <Form.Check
        onChange={e => {
          this.setState({isAdmin : !e.currentTarget.checked})
          this.setState({isSec : e.currentTarget.checked})
          this.setState({isAgent : !e.currentTarget.checked})
          this.setState({isStdUsr : !e.currentTarget.checked})
        }}
        type="radio"
        label={`Secretary`}
        id={`Secretary`}
        checked={this.state.isSec === true}
  
        />
        <Form.Check
        onChange={e => {
          this.setState({isAdmin : !e.currentTarget.checked})
          this.setState({isSec : !e.currentTarget.checked})
          this.setState({isAgent : !e.currentTarget.checked})
          this.setState({isStdUsr : e.currentTarget.checked})
        }}
        type="radio"
        label={`Standart user`}
        id={`standartUser`}
        checked={this.state.isStdUsr === true}
        />
        </FormGroup>
    </fieldset>      
    </div>
    }
    
  }
  
  
  export const UserRoles = () => {
  return (
    <div key={`Admin`} className="mb-3">
    <Form.Check
      disabled
      type="radio"
      label={`radio`}
      id={`Admin`}
    />
    <Form.Check
      disabled
      type="radio"
      label={`Agent`}
      id={`Agent`}
    />
    <Form.Check
      disabled
      type="radio"
      label={`Secretary`}
      id={`Secretary`}
    />
    <Form.Check
      disabled
      type="radio"
      label={`Standart user`}
      id={`standartUser`}
      defaultChecked
    />
  </div>
  )
  }