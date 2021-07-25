import React, {useState} from 'react';
import { Component } from 'react';
import {Navigation} from 'react-minimal-side-navigation';
import 'react-minimal-side-navigation/lib/ReactMinimalSideNavigation.css';
import { withRouter } from "react-router-dom";
import "./Navbar.css"

class NavBar extends Component{
    username = ""
    constructor(props){
        super(props)
        this.state = {
            isAdmin: false, isAuthed: false
        }
        this.componentDidMount=this.componentDidMount.bind(this);
    }
    adminNav = [
        {
          title: 'All courses',
          itemId: '/courses',
        },
        {
          title: 'All users',
          itemId: '/users',
        },
        {
          title: 'Agent managment',
          itemId: '/agents',
        },
        {
          title: 'My profile',
          itemId: '/users/admin',
        },
      ]
    studentNav = [
        {
            title: 'All courses',
            itemId: '/courses',
          },
          {
            title: 'My assignments',
            itemId: '/assignments',
          },
          {
            title: 'My profile',
            itemId: '/users/',
          },
          {
            title: 'My appeals',
            itemId: '/appeals/',
          },
    ]  


    componentDidMount(){
        if (getCookie("submit-last-server-state") !== undefined && getCookie("submit-last-server-state") !== ""){
            this.username = JSON.parse(getCookie("submit-last-server-state")).user_name
            var role = JSON.parse(getCookie("submit-last-server-state")).roles[0]
            if (role === "admin"){
                this.setState({isAdmin: true})
            }
            this.setState({isAuthed: true}, () => {
                console.log("Auted:",this.state.isAuthed, this.state.isAdmin)
            })
        }
    }
    selected = (selected) => {
        if (selected.itemId === "/users/") {
            console.log("pushing to", selected.itemId + this.username)
            this.props.history.push(selected.itemId + this.username)
            this.props.history.go(0)
        } else {
            this.props.history.push(selected.itemId)
            this.props.history.go(0)
        }
    }


    render(){
        return (
          <div className="Navbar">
            {this.state.isAuthed && <Navigation
                onSelect={this.selected}
                items={ this.state.isAdmin ? this.adminNav : this.studentNav}
              />}
            </div>
    
        );
    }
    }

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }
  
  function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
  }

const userAuthFunc = () => {
    var cookie = getCookie("submit-server-cookie")
    var stateCookie = getCookie("submit-last-server-state")
    if (cookie === undefined || stateCookie === undefined || stateCookie === "" ) {
      setCookie('submit-last-visited-path', window.location.pathname, 0.0034);
     return false
    }
    return true
  }

  export default withRouter(NavBar);
