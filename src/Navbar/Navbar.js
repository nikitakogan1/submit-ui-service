import React from 'react';
import {Navigation} from 'react-minimal-side-navigation';
import 'react-minimal-side-navigation/lib/ReactMinimalSideNavigation.css';
import { withRouter } from "react-router-dom";
import "./Navbar.css"

function NavBar(props) {
    var isAdmin = false;
    var adminNav = [
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
          itemId: '/users/',
        },
      ]
    var studentNav = [
        {
            title: 'All courses',
            itemId: '/courses',
          },
          {
            title: 'Assignments',
            itemId: '/users',
          },
          {
            title: 'My profile',
            itemId: '/users/',
          },
    ]  
    if (getCookie("submit-last-server-state") !== undefined){
        var username = JSON.parse(getCookie("submit-last-server-state")).user_name
        var role = JSON.parse(getCookie("submit-last-server-state")).roles[0]
        if (role === "admin"){
            isAdmin = true;
        }
    }
    const selected = (selected) => {
        if (selected.itemId === "/users/") {
            console.log("pushing to", selected.itemId + username)
            props.history.push(selected.itemId + username)
        } else {
            props.history.push(selected.itemId)
        }
    }
    var auth = userAuthFunc()
    return (
        <div className="Navbar">
        {<Navigation
           onSelect={selected}
            items={ isAdmin ? adminNav : studentNav}
          />}
        </div>

    );
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
    if (cookie === undefined || stateCookie === undefined) {
      setCookie('submit-last-visited-path', window.location.pathname, 0.0034);
     return false
    }
    return true
  }

  export default withRouter(NavBar);
