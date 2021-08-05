import { Fragment } from "react";
import { Component } from "react";
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import BootstrapTable from 'react-bootstrap-table-next';
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

const AlertNoMessages = () => <div class="alert alert-info" role="alert">No Messages Here...</div>;

export default class FormMessages extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            elements: null,
            showNewMsgModal: false,
            limit: 5,
            after_id: 0,
            left_to_process: false,
            pollingInterval: 0
        }
        this.elementBucket = props.elementBucket;
        this.elementKey = props.elementKey;
        this.isLoaded = this.isLoaded.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.goToBackEnd = this.goToBackEnd.bind(this);
        this.createMessage = this.createMessage.bind(this);
        this.componentWillUnmount = this.componentWillUnmount.bind(this);
    }

    isLoaded() {
        return this.state.isLoaded;
    }

    goToBackEnd() {
        let url = window.location.origin + "/api/messages/" + this.elementBucket + "/" + this.elementKey + "?limit=" + this.state.limit
        if (this.state.after_id > 0) {
            url = url + "&after_id=" + this.state.after_id
        }
        fetch(url).then((resp) => {
            if (resp.status !== 200) {
                alert("error fetching messages. Status code is " + resp.status);
                this.props.history.push("/internal-error");
                this.props.history.go(0);
                return null;
            }
            this.setState({left_to_process: resp.headers.has("X-Elements-Left-To-Process")});
            return resp.json()
        }).then((data) => {
            if (data !== null) {
                this.setState({elements: data.elements}, () => this.setState({isLoaded: true, pollingInterval: setInterval(() => {
                    let polledUrl = window.location.origin + "/api/messages/" + this.elementBucket + "/" + this.elementKey + "?limit=" + this.state.limit
                    if (this.state.after_id > 0) {
                        polledUrl = polledUrl + "&after_id=" + this.state.after_id
                    }
                    fetch(polledUrl).then((resp) => {
                        if (resp.status !== 200) {
                            console.log("error fetching messages. Status code is " + resp.status);
                            return null;
                        }
                        this.setState({left_to_process: resp.headers.has("X-Elements-Left-To-Process")});
                        return resp.json()
                    }).then((data) => {
                        if (data !== null) {
                            this.setState({elements: data.elements});
                        }
                    })
                }, 3000)}));
            } else {
                this.setState({isLoaded: true});
            }
        })
    }

    componentWillUnmount() {
        clearInterval(this.state.pollingInterval);
    }

    componentDidMount() {
        this.goToBackEnd();
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
        dataField: "text",
        text: "Text"
    },{
        dataField: "from",
        text: "From"
    },{
        dataField: "created_on",
        text: "Created On",
        formatter: (cell) => <h10>{new Date(cell).toString()}</h10>
    }]

    createMessage(e) {
        e.preventDefault(e);
        fetch(window.location.origin + "/api/messages/" + this.elementBucket + "/" + this.elementKey, {method: "POST", body: JSON.stringify({text: e.target.text.value})}).then((resp) => {
            if (resp.status !== 202) {
                alert("error creating message. Status code is " + resp.status); 
                this.props.history.push("/internal-error");
            } else {
                alert("message created succesfully");
            }
            this.props.history.go(0);
        })
    }

    render() {
        return <div>
            {this.isLoaded() && <Fragment>
                <Modal open={this.state.showNewMsgModal} center onClose={() => this.setState({showNewMsgModal: false})}>
                    <br></br>
                    <div>
                        <Form onSubmit={this.createMessage}>
                            <Form.Row>
                                <Form.Group controlId="text">
                                    <Form.Label>Message</Form.Label>
                                    <Form.Control as="textarea" type="text" defaultValue={this.state.text} />
                                </Form.Group>
                            </Form.Row>
                            <br></br>
                            <Button variant="primary" type="submit">Submit</Button>
                        </Form>
                    </div>
                </Modal>
                {this.state.elements === null && <AlertNoMessages/>}
                {this.state.elements !== null && <BootstrapTable hover keyField="id" data={this.state.elements} columns={this.columns}/>}
                <div className="input-group">
                    {this.state.after_id > 0 && <Button variant="primary" onClick={this.previousPage} style={{position: "absolute", left: 0}}>Previous</Button>}
                    {this.state.elements !== null && this.state.left_to_process && <Button variant="primary" onClick={this.nextPage} style={{position: "absolute", right: 0}}>Next</Button>}
                </div>
                <br></br><br></br> 
                {this.elementBucket !== "users" && <Button variant="primary" onClick={() => this.setState({showNewMsgModal: true})}>New</Button>}
            </Fragment>}
        </div>
    }

}
