import React from "react";
import { Form } from "react-bootstrap";

export default class MyForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      courses: [
        { value: 1, display: "first option" },
        { value: 2, display: "second option" },
        { value: 3, display: "third option" }
      ],
      selectedNames: []
    };
  }

 

  render() {
    return (
<div>Hello</div>
    );
  }
}


