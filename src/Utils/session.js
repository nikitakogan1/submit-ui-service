import {Redirect, Route} from 'react-router-dom';

export function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

export function setCookie(name, value) {
    var expires = "";
    var date = new Date();
    date.setTime(date.getTime() + 10*60*1000);
    expires = "; expires=" + date.toUTCString();
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

export function eraseCookie(name) {   
    if (getCookie(name) !== undefined) {
        var expires = "";
        var date = new Date();
        date.setTime(date.getTime() + 1);
        expires = "; expires=" + date.toUTCString();
        document.cookie = name + "={}" + expires + "; path=/";
    }
}

export function isLoggedIn() {
    return getCookie("submit-server-cookie") !== undefined && getCookie("submit-last-server-state") !== undefined;
}

export function getLoggedInUserName() {
  let stateCookie = getCookie("submit-last-server-state");
  if (stateCookie !== undefined && stateCookie !== undefined && stateCookie !== "") {
    return JSON.parse(stateCookie).user_name;
  }
  return "";
}

export function doesUserHaveRole(role) {
  let stateCookie = getCookie("submit-last-server-state");
  if (stateCookie !== undefined && stateCookie !== undefined && stateCookie !== "") {
    let stateCookieJson = JSON.parse(stateCookie);
    return stateCookieJson.roles !== null && stateCookieJson.roles.indexOf(role) >= 0;
  }
  return false;
}

export function isStaffCourse(courseKey) {
  let stateCookie = getCookie("submit-last-server-state");
  if (stateCookie !== undefined && stateCookie !== undefined && stateCookie !== "") {
    let stateCookieJson = JSON.parse(stateCookie);
    return stateCookieJson.staff_courses !== null && stateCookieJson.staff_courses.indexOf(courseKey) >= 0;
  }
  return false;
}

export function isStudentCourse(courseKey) {
  let stateCookie = getCookie("submit-last-server-state");
  if (stateCookie !== undefined && stateCookie !== undefined && stateCookie !== "") {
    let stateCookieJson = JSON.parse(stateCookie);
    return stateCookieJson.student_courses !== null && stateCookieJson.student_courses.indexOf(courseKey) >= 0;
  }
  return false;
}

export const SessionRoute = ({ component: Component, ...rest }) => {
    var cookie = getCookie("submit-server-cookie");
    var stateCookie = getCookie("submit-last-server-state");
    let isLoggedIn = true;
    if (cookie === undefined || stateCookie === undefined) {
        // make sure no cookies remain
        eraseCookie("submit-server-cookie");
        eraseCookie("submit-last-server-state");
        isLoggedIn = false
    } else {
      setCookie("submit-last-server-state", stateCookie);
    }
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
