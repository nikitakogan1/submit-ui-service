import { Component } from 'react';
import {Navigation} from 'react-minimal-side-navigation';
import 'react-minimal-side-navigation/lib/ReactMinimalSideNavigation.css';
import { withRouter } from "react-router-dom";
import "./Navbar.css";
import {getCookie, eraseCookie} from  "../Utils/session";

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
          title: 'My profile',
          itemId: '/users/',
        },
        {
          title: 'Logout',
          itemId: 'logout',
        },
        {
          title: 'All courses',
          itemId: '/courses',
        },
        {
          title: 'All assignment definitons',
          itemId: '/assignment_definitions',
        },
        {
          title: 'All assignments instances',
          itemId: '/assignment_instances',
        },
        {
          title: 'All tests',
          itemId: '/tests',
        },
        {
          title: 'All tasks',
          itemId: '/tasks',
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
          title: 'My messages',
          itemId: '/messages',
        },
      ]
    studentNav = [
          {
            title: 'My profile',
            itemId: '/users/',
          },
          {
            title: 'Logout',
            itemId: 'logout',
          },
          {
            title: 'My courses',
            itemId: '/courses',
          },
          {
            title: 'My assignments',
            itemId: '/assignment_instances',
          },
          {
            title: 'My appeals',
            itemId: '/appeals',
          },
          {
            title: 'My messages',
            itemId: '/messages',
          },
    ]  


    componentDidMount(){
      let stateCookie = getCookie("submit-last-server-state");
        if (stateCookie !== undefined && stateCookie !== ""){
            let stateCookieJson = JSON.parse(stateCookie);
            this.username = stateCookieJson.user_name;
            if (stateCookieJson.roles.indexOf("admin") >= 0){
                this.setState({isAdmin: true})
            }
            this.setState({isAuthed: true})
        }
    }

    selected = (selected) => {
        if (selected.itemId === "/users/") {
            this.props.history.push(selected.itemId + this.username);
            this.props.history.go(0);
        } else if (selected.itemId === "logout") {
          eraseCookie("submit-server-cookie");
          eraseCookie("submit-last-server-state");
          this.props.history.push("/");
          this.props.history.go(0);
        } else {
            this.props.history.push(selected.itemId);
            this.props.history.go(0);
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

  export default withRouter(NavBar);
