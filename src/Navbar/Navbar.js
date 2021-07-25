import { Component } from 'react';
import {Navigation} from 'react-minimal-side-navigation';
import 'react-minimal-side-navigation/lib/ReactMinimalSideNavigation.css';
import { withRouter } from "react-router-dom";
import "./Navbar.css";
import {getCookie} from  "../Utils/session";

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
            title: 'My courses',
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

  export default withRouter(NavBar);
