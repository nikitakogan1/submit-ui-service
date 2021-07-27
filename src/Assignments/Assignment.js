import { Component } from "react";
import {getLoggedInUserName} from "../Utils/session";
import Form from "react-bootstrap/Form"
import "./Assignment.css"

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

    onChangeHandler=event=>{
        var files = event.target.files;
        console.log("the files",files);
        console.log(this.validateSize(files));
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
        console.log(this.state.selectedFile);
        data.append('file', this.state.selectedFile)
        console.log("Data",data);
        //send the request
        //TODO: Ask david about how to make the requests.
 
  };

    validateSize=(files)=>{
        let sum = 0
        let size = 30000;
        console.log("filessss", JSON.stringify(files))
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
            <div> Hello from assignment {window.location.pathname}
            <Form onSubmit={this.fileUploadHandler}>
                <Form.Group onChange={this.onChangeHandler} controlId="formFileMultiple" className="mb-3">
                    <Form.Label >Submit assignment</Form.Label>
                    <Form.Control id="submitAssignmentBut" type="file" multiple  size="lg" />
                </Form.Group> 
            </Form>
            </div>
        )
    }

}