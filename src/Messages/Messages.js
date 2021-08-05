import { Component } from "react";
import { withRouter } from "react-router-dom";
import FormMessages from "../FormMessages/FormMessages";
import { getLoggedInUserName } from "../Utils/session";

class Messages extends Component {

  render() {
    this.props.navbar(true);
    return (
      <FormMessages elementBucket="users" elementKey={getLoggedInUserName()} history={this.props.history}/>
    )
  }
  
}

export default withRouter(Messages);


 

















