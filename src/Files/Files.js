import { Component, createRef } from "react";

export default class SubmitFiles extends Component {

    constructor(props) {
        super(props);
        this.state = {
            path: props.path
        }
        this.componentDidMount=this.componentDidMount.bind(this);
    }

    linkRef = createRef();

    componentDidMount() {
        this.props.navbar(true);
        let path = window.location.pathname.slice(6);
        let sepIndex = path.lastIndexOf("/") + 1;
        let fileName = path.substring(sepIndex);
        let dirPath = path.substring(0, sepIndex - 1);
        fetch(window.location.origin + "/api/files" + dirPath, {method: "GET", headers:{"X-Submit-File": fileName}}).then((response) => {
            if (response.status !== 200) {
                alert("error downloading file. Status code is " + response.status);
                this.props.history.push("/internal-error");
                this.props.history.go(0);
            }
            return response.blob();
        }).then((blob) => {
            if (blob != null) {
                const url = window.URL.createObjectURL(
                    new Blob([blob]),
                );
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute(
                    'download',
                    fileName,
                );
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
                this.props.history.goBack();
            }
        }).catch(err => alert(err));
    }

    render() {
        return <div></div>
    }

}
