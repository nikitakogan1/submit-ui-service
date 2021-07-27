import { Component } from "react";
import {getLoggedInUserName} from "../Utils/session";
import Form from "react-bootstrap/Form"
import "./Assignment.css"
import Button from "react-bootstrap/Button"

export default class Assignment extends Component{
    constructor(props){
        super(props)
        this.state = {
            info: null, selectedFiles: null
        }
    }
    componentDidMount(){
        this.props.navbar(true);
        this.goToBackEnd();
    }


    goToBackEnd() {
        //http://localhost:8080/assignment_instances/1/2021/ass4/nikita
        var username = getLoggedInUserName()
        var url = window.location.origin + "/api/" + window.location.pathname + "/" + username
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

    onChangeHandler=event=>{
        var files = event.target.files;
        if(this.validateSize(files)){ 
            console.log("files",files);
        // if return true allow to setState
            this.setState({selectedFiles: files});
        } else {
            // files are too big.
            //TODO: pop up
        }
}

    fileUploadHandler = () => {
        const data = new FormData()
        data.append('file', this.state.selectedFiles)
        console.log("Data",data);
        //send the request
        //TODO: Ask david about how to make the requests.
 
  };


    columns = [{
        dataField: 'assignment_def',
        text: 'Assignment',
    }, {
        dataField: 'grade',
        text: 'Grade',
    }, {
        dataField: 'copy',
        text: 'Copy detection',
    },
    ];


    validateSize=(files)=>{
        let sum = 0
        let size = 30000;
        for (let i=0;i<files.length;i++){
            console.log(files[i].size);
            sum += files[i].size
            if (sum > size) {
                return false
            }
        }
        return true
    };


    render(){
        return (
            //should remove hello later.
            
            <Form >
                <Form.Group onChange={this.onChangeHandler} controlId="formFileMultiple" className="mb-3">
                    <Form.Label >Submit assignment</Form.Label>
                    <Form.Control type="file" multiple  size="lg" />
                </Form.Group> 
                <Button variant="primary" id= "assignmentUploadBut" onClick={this.fileUploadHandler}>Submit assignment</Button>
            </Form>
        )
    }

}