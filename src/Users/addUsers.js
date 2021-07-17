import React from "react";
import "./User.css"
import Button from "react-bootstrap/Button"
import  { useState } from 'react';
import Modal from "react-bootstrap/Modal"
import GetCoursesList from "./User"

export default function AddUserToCourseAsStudentModal(props) {
    const [show, setShow] = useState(false);
  
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
  
  
    return (
      <>
        <Button id="addUserAsStudent" variant="primary" onClick={handleShow}>
          Add user to course as student
        </Button>
  
        <Modal show={show} onHide={handleClose} animation={false}>
          <Modal.Header closeButton>
            <Modal.Title>Choose course</Modal.Title>
          </Modal.Header>
          <Modal.Body>
  <GetCoursesList history={props.history} courses_as_student={props.courses_as_student} close={handleClose} userURL={props.userURL} user_name={props.user_name}></GetCoursesList>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
  
  export function AddUserToCourseAsStaffModal(props) {
    const [show, setShow] = useState(false);
  
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
  
  
    return (
      <>
        <Button id="addUserAsStaff" variant="primary" onClick={handleShow}>
          Add user to course as staff
        </Button>
  
        <Modal show={show} onHide={handleClose} animation={false}>
          <Modal.Header closeButton>
            <Modal.Title>Choose course</Modal.Title>
          </Modal.Header>
          <Modal.Body>
  <GetCoursesList history={props.history} courses_as_staff={props.courses_as_staff} close={handleClose} userURL={props.userURL} user_name={props.user_name}></GetCoursesList>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }