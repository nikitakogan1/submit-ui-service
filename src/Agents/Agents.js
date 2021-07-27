import { Component } from "react";
import BootstrapTable from 'react-bootstrap-table-next';
import Button from "react-bootstrap/Button";

export default class AgentList extends Component {

    constructor(props){
        super(props);
        this.state = {
            left_to_process: false,
            after_id: 0,
            limit: 5,
            elements: null
        }
        this.goToBackEnd=this.goToBackEnd.bind(this);
        this.componentDidMount=this.componentDidMount.bind(this);
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
        dataField: 'id',
        text: 'Agent ID',
        formatter: (cell, row) => <a href={"/agents/" + cell}> {cell} </a>,
      }, {
        dataField: 'status',
        text: 'Status',
        formatter: (cell, row) => <div></div>,
        style: function callback(cell, row, rowIndex, colIndex) {
          if (cell === 0) {
            return { backgroundColor: 'green' };
          } else if (cell === 1) {
            return { backgroundColor: 'red' };
          }
          return {};
        }
      },
      {
        dataField: 'hostname',
        text: 'Host name'
      }, {
        dataField: 'ip_address',
        text: 'IP'
      },
      {
        dataField: 'os_type',
        text: 'OS'
      },
      {
        dataField: 'architecture',
        text: 'Architecture'
      },
      {
        dataField: 'last_keepalive',
        text: 'Last keepalive',
        formatter: (cell, row) => <h10>{new Date(cell).toString()}</h10>
      },
      {
        dataField: 'logged_in_user',
        text: 'User'
      },
      {
        dataField: 'num_running_tasks',
        text: 'num running tasks'
      },
    ];

    componentDidMount() {
        this.props.navbar(true);
        this.goToBackEnd();
    }

    goToBackEnd() {
        var url = window.location.origin + '/api/agents/?limit='+ this.state.limit
        if (this.state.after_id > 0) {
          url = url + "&after_id=" + this.state.after_id
        }
        fetch(url, {method:'GET'})
        .then((response) => {
          if (response.status === 403){
            this.props.history.push("/unauthorized");
            this.props.history.go(0);
          }
          if (response.headers.has("X-Elements-Left-To-Process")){
              this.setState({left_to_process:true})
          } else {
              this.setState({left_to_process:false})
          }
          return response.json()
        })
        .then (data => {
          this.setState({elements:data.elements});
        });
    }

    render() {
        return (
            <div>
            { this.state.elements !== null && this.state.elements.length > 0 && <BootstrapTable hover keyField='id' data={ this.state.elements } columns={ this.columns } /> }
            {this.state.after_id > 0 && <Button variant="primary" id= "UsersPrevPage" onClick={this.previousPage}>Previons page</Button>}
            {this.state.left_to_process === true && <Button variant="primary" id= "UsersNextPage" onClick={this.nextPage}>Next page</Button>}
            </div>
        )
    }





}