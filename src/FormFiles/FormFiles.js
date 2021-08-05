import Button from "react-bootstrap/Button";
import {Component, Fragment} from "react";
import BootstrapTable from 'react-bootstrap-table-next';
import Form from "react-bootstrap/Form"
import axios from 'axios';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { Spinner } from "react-bootstrap";

const AlertNoFiles = () => <div class="alert alert-info" role="alert">No Files Yet...</div>;

export default class FormFiles extends Component {

    constructor(props) {
        super(props);
        this.state = {
            elements: props.files.elements,
            selectedFiles: [],
            fileToDelete: null,
            showActionModal: false
        }
        this.elementBucket = props.elementBucket;
        this.elementKey = props.elementKey;
        this.allowModification = props.allowModification;
    }

    columns = [{
        dataField: "file_name",
        text: "File Name",
        formatter: (cell, _) => <a href={window.location.origin + "/files/" + this.elementBucket + "/" + this.elementKey + "/" + cell}> {cell} </a>
    }]

    fileUploadSelectionHandler = event => this.setState({selectedFiles: event.target.files});

    fileUploadHandler = () => {
        this.setState({showActionModal: true})
        const formData = new FormData();
        Array.from(this.state.selectedFiles).forEach((file => formData.append(file.name, file)));
        axios.post(window.location.origin + "/api/files/" + this.elementBucket + "/" + this.elementKey, formData, {headers: {"content-type": "multipart/form-data"}}).then((resp) => {
            if (resp.status === 202) {
                alert("file(s) uploaded sucessfully");
            } else {
                alert("error uploading files: " + resp.status + "status code");
            }
            this.setState({showActionModal: false})
            this.props.history.go(0);
        }).catch(err => alert(err));
    }

    fileDeletionHandler = () => {
        this.setState({showActionModal: true})
        fetch(window.location.origin + "/api/files/" + this.elementBucket + "/" + this.elementKey, {method: "DELETE", headers: {"X-Submit-File": this.state.fileToDelete}}).then((resp) => {
            if (resp.status !== 202) {
                alert("error deleting file. Status code is " + resp.status);
            } else {
                alert("file deleted succesfully");
            }
            this.setState({showActionModal: false})
            this.props.history.go(0);
        }).catch(err => alert(err));
    }

    onFileSelectedForDeletion = (row, isSelect, rowIndex, e) => {
        this.setState({fileToDelete: row.file_name});
    }

    selectFileToDelete = {
        mode: "radio",
        clickToSelect: false,
        onSelect: this.onFileSelectedForDeletion
    }

    render() {
        let fileNameObjs = [];
        Object.keys(this.state.elements).forEach((fileNameStr) => fileNameObjs.push({"file_name": fileNameStr}));
        return (
            <Fragment>
                <Modal style={{maxHeight:100, maxWidth:100}} open={this.state.showActionModal} onClose={() => {}} center showCloseIcon={false}>
                    <Spinner animation="border" variant="primary" />
                </Modal>
                {fileNameObjs.length > 0 && <BootstrapTable hover keyField="file_name" data={fileNameObjs} columns={this.columns} pagination={paginationFactory({showTotal: true})} selectRow={this.allowModification ? this.selectFileToDelete : undefined}/>}
                {fileNameObjs.length <= 0 && <AlertNoFiles/>}
                {this.allowModification && <Form>
                    <Form.Group onChange={this.fileUploadSelectionHandler} controlId="formFileMultiple" className="mb-3">
                        <Form.Control type="file" multiple/>
                        <Button style={{margin: 3}} variant="primary" id="uploadFilesButton" disabled={this.state.selectedFiles.length <= 0} onClick={this.fileUploadHandler}>Upload</Button>
                        <Button style={{margin: 3}} variant="primary" id="deleteFilesButtion" disabled={this.state.fileToDelete === null} onClick={this.fileDeletionHandler}>Delete</Button>
                    </Form.Group> 
                </Form>}
            </Fragment>
        );
    }

}
