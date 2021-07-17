import React from "react";
import { Route, Redirect } from "react-router-dom";


export const AlertSuccess = () => {
    return (
      <div class="alert alert-success" role="alert">
      User data updated successfully!
      </div>
    )
}

export const AlertFailed = () => {
    return (
     <div class="alert alert-danger" role="alert">
       Failed to update user data! try again!
     </div>
    )
}

export function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}
  
export function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

export const userAuthFunc = () => {
    var cookie = getCookie("submit-server-cookie")
    var stateCookie = getCookie("submit-last-server-state")
    if (cookie === undefined || stateCookie === undefined) {
      setCookie('submit-last-visited-path', window.location.pathname, 0.0034);
     return false
    }
    return true
  }

  export const parseCourses = (coursesList) => {
    var courses=[]
    if (coursesList === undefined){
      return []
    }
    for (let i = 0; i < coursesList.length; i++) {
     courses[i] = coursesList[i].number + " / " + coursesList[i].year + " / " + coursesList[i].name
     console.log(courses[i])
   }
   console.log(courses)
   return courses
  }

  export const UserPrivateRoute = ({ component: Component, ...rest }) => {

    // Add your own authentication on the below line.
    const isLoggedIn = userAuthFunc()
    
    return (
      <Route
        {...rest}
        render={props =>
          isLoggedIn ? (
            <Component {...props} {...rest} />
          ) : (
            <Redirect to={{ pathname: '/' }} />
          )
        }
      />
    )
  }
  