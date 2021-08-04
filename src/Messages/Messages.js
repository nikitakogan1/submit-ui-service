
import React from "react";
import { Component } from "react";
import { withRouter } from "react-router-dom";
//import "./Messages.css"
import BootstrapTable from 'react-bootstrap-table-next';
import Button from "react-bootstrap/Button"
import {getLoggedInUserName} from "../Utils/session";
import { Modal }  from 'react-responsive-modal';
import Form from "react-bootstrap/Form"
import Col from "react-bootstrap/Col"
import "./Messages.css"


class Messages extends Component {

  constructor(props) {
    super(props);
    this.state = {to: "", text: "", showModal: false, left_to_process:false,limit:5, after_id:0, elements: []
  };
  this.componentDidMount=this.componentDidMount.bind(this);
  this.goToBackEnd=this.goToBackEnd.bind(this);
  this.nextPage=this.nextPage.bind(this);
  this.previousPage=this.previousPage.bind(this);
  this.handleCloseModal=this.handleCloseModal.bind(this);
  this.handleShowModal=this.handleShowModal.bind(this);
  this.sendNewMessage=this.sendNewMessage.bind(this);
  }



  nextPage = () => {
    this.setState({after_id: this.state.after_id + this.state.limit}, () => {
        this.goToBackEnd()
    })
  }

  previousPage = () => {
    this.setState({after_id: this.state.after_id - this.state.limit}, () => {
        this.goToBackEnd()
    })
  }

  columns = [{
    dataField: 'from',
    text: 'From',
  }, {
    dataField: 'text',
    text: 'Message content',
  },
  {
    dataField: 'updated_on',
    text: 'Sent on',
    formatter: (cell, row) => <h10>{new Date(cell).toString()}</h10>
  }
];


    componentDidMount() {
      this.props.navbar(true);
      this.goToBackEnd();
    }

    goToBackEnd() {
      var header = {'X-Submit-User': getLoggedInUserName() }
      if (getLoggedInUserName() === "admin"){
        header = {}
      }
      var url = window.location.origin + '/api/messages/users/' + getLoggedInUserName() + '?limit='+ this.state.limit
      if (this.state.after_id > 0) {
        url = url + "&after_id=" + this.state.after_id
      }
      fetch(url, {method:'GET', 
      headers: header})
      .then((response) => {
        if (response.headers.has("X-Elements-Left-To-Process")){
            this.setState({left_to_process:true})
        } else {
            this.setState({left_to_process:false})
        }
        return response.json()
      })
      .then (data => {
        this.setState({elements:data.elements}, () => {
          console.log(this.state.elements)
        });
      });
    }

    handleCloseModal(){
      this.setState({showModal: false})
    }

    handleShowModal(){
      this.setState({showModal: true})
    }

    sendNewMessage(event) {
      event.preventDefault(event);
      console.log(event.target.to.value)
      console.log(event.target.text.value)
      var body  = {text: event.target.text.value}
      var url = window.location.origin + '/api/messages/users/' + event.target.to.value
      fetch(url, {method:'POST' , body: JSON.stringify(body)})
      .then((response) => {
        if (response.ok){
          alert("Message send successfully")
          this.setState({showModal: false})
        } else {
          alert("Failed to send the message. check the reciever user name")
          this.setState({showModal: false})
        }
        return response.json()
      })

    }

    render(){
      return (

      <React.Fragment>
        {(this.state.elements === null || this.state.elements === []) && <AlertNoMessages></AlertNoMessages>}
     {this.state.elements  !== null && <BootstrapTable hover keyField='updated_on' data={ this.state.elements } columns={ this.columns } />} 
            {this.state.after_id > 0 && <Button  variant="primary" id= "MessagePrevPage" onClick={this.previousPage}>
                Previons page
            </Button>}
            {this.state.left_to_process === true && <Button  variant="primary" id= "MessageNextPage" onClick={this.nextPage}>
                Next page
            </Button>}
            <Button id="NewMessageBut" variant="primary"  onClick={this.handleShowModal}>New message</Button>


        <Modal id="sendNewMessageModal" open={this.state.showModal} center onClose={this.handleCloseModal}>
        <div className="sendNewMessage">
        <Form id="NewMessageForm" onSubmit={this.sendNewMessage}>
            <Form.Row>
                <div class="input-group">
                        <Form.Group className="mb-3" controlId="to">
                            <Form.Label>To</Form.Label>
                            <Form.Control type="text"  defaultValue={this.state.to} />
                        </Form.Group>
                </div>
            </Form.Row>
            <Form.Row>
                <Form.Group className="" controlId="text">
                  <Form.Label>Content</Form.Label>
                    <Form.Control  as="textarea" type="text"  defaultValue={this.state.text} />
                </Form.Group>
            </Form.Row>
            <Button id="submitNewMessage" variant="primary" type="submit">
            Send
          </Button>
            </Form>
        </div>
        </Modal>

      </React.Fragment>
      );
      }
  
   }

   const AlertNoMessages = () => <div class="alert alert-info" role="alert">No Messages Yet...</div>;


  export default withRouter(Messages);


 

















