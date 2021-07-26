import { Component } from "react";
import {getLoggedInUserName} from "../Utils/session";

export default class Assignment extends Component{
    constructor(props){
        super(props)
        this.state = {
            info: null
        }
    }
    componentDidMount(){
        this.props.navbar(true);
        this.goToBackEnd();
    }


    goToBackEnd() {
        //http://localhost:8080/assignment_instances/1/2021/ass4/nikita
        var username = getLoggedInUserName()
        console.log("the username is", username)
        var url = window.location.origin + "/api/" + window.location.pathname.replace("/assignments","assignment_instances") + "/" + username
        console.log(url)
        //headers {'X-Submit-User': getLoggedInUserName()}
        fetch(url, {method:'GET'})
        .then((response) => {
          if (response.status === 403){
            this.props.history.push("/unauthorized");
            this.props.history.go(0);
          }
          return response.json()
        })
        .then (data => {
          this.setState({info:data}, () => {
              console.log(this.state.info)
          });
        });
    }





    render(){
        return (
            <div> Hello from assignment {window.location.pathname}</div>
        )
    }

}