import React from 'react';
import {Navigation} from 'react-minimal-side-navigation';
import 'react-minimal-side-navigation/lib/ReactMinimalSideNavigation.css';
import { Route, Redirect } from "react-router-dom";
import "./Navbar.css"
export default function NavBar() {
    return (
        <div className="Navbar">
        <Navigation
            items={[
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
            ]}
          />
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

