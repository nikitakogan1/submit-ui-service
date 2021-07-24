import { Component } from "react";
import BootstrapTable from 'react-bootstrap-table-next';

export default class AgentList extends Component {

    constructor(props){
        super(props);
        this.state = {
            left_to_process: false,
            after_id: 0,
            limit: 1,
            elements: null
        }
        this.goToBackEnd=this.goToBackEnd.bind(this);
        this.componentDidMount=this.componentDidMount.bind(this);
    }

    columns = [{
        dataField: 'id',
        text: 'Agent ID',
        formatter: (cell, row) => <a href={"/agents/" + cell}> {cell} </a>,
      }, {
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
        text: 'Last keepalive'
      },
      {
        dataField: 'logged_in_user',
        text: 'User'
      },
      {
        dataField: 'num_running_task',
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
        console.log(url)
        fetch(url, {method:'GET'})
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

    render() {
        return (
            <div>
            { this.state.elements !== null && this.state.lenght !== 0 && <BootstrapTable hover keyField='id' data={ this.state.elements } columns={ this.columns } /> }
            </div>
        )
    }





}