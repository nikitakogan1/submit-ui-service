import {Component, Fragment} from "react";
import ReactJson from "react-json-view";

export default class Task extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            data: null
        };
        this.isLoaded = this.isLoaded.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
    }

    componentDidMount() {
        this.props.navbar(true);
        fetch(window.location.origin + "/api" + window.location.pathname).then((response) => {
            if (response.status === 403) {
                this.props.history.push("/unauthorized");
                this.props.history.go(0);
            } else if (response.status === 404) {
                this.props.history.push("/not-found");
                this.props.history.go(0);
            } else if (response.status !== 200) {
                this.props.history.push("/internal-error");
                this.props.history.go(0);
            }
            return response.json();
        }).then(data => this.setState({data: data}, () => this.setState({isLoaded: true})));
    }

    isLoaded() {
        return this.state.isLoaded;
    }

    render() {
        return (
            <Fragment>
                {this.isLoaded() && <ReactJson src={this.state.data}/>}
            </Fragment>
        )
    }

}
