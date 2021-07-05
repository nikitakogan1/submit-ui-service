import React from 'react';
import  {Component}   from 'react';
import FocusTrap from 'focus-trap-react';
import ReactDOM from 'react-dom';

export class UserContainer extends Component {
  state = { isShown: false };
  showModal = () => {
    this.setState({ isShown: true }, () => {
      this.closeButton.focus();
    });
    this.toggleScrollLock();
  };
  closeModal = () => {
    this.setState({ isShown: false });
    this.TriggerButton.focus();
    this.toggleScrollLock();
  };
  onKeyDown = (event) => {
    if (event.keyCode === 27) {
      this.closeModal();
    }
  };
  onClickOutside = (event) => {
    if (this.modal && this.modal.contains(event.target)) return;
    this.closeModal();
  };

  toggleScrollLock = () => {
    document.querySelector('html').classList.toggle('scroll-lock');
  };

  render() {
      console.log("the state from initial component is", this.props.user)
    return (
      <React.Fragment>
        <TriggerButton
          showModal={this.showModal}
          buttonRef={(n) => (this.TriggerButton = n)}
          triggerText={this.props.triggerText}
        />
        {this.state.isShown ? (
          <Modal 
            user={this.props.user}
            onSubmit={this.props.onSubmit}
            modalRef={(n) => (this.modal = n)}
            buttonRef={(n) => (this.closeButton = n)}
            closeModal={this.closeModal}
            onKeyDown={this.onKeyDown}
            onClickOutside={this.onClickOutside}
          />
        ) : null}
      </React.Fragment>
    );
  }
}


export const Form = (props) => {
  console.log("the user in the form is ",props.user)
  var user = props.user
  return (
    <form onSubmit={props.onSubmit}>
      <div className="form-group">
        <label htmlFor="user_name">Username</label>
        <input className="form-control" id="user_name" defaultValue={user.user_name} />
      </div>  
      <div className="form-group">
        <label htmlFor="first_name">First Name</label>
        <input className="form-control" id="first_name" defaultValue={user.first_name} />
      </div>
      <div className="form-group">
        <label htmlFor="lasT_name">Last Number</label>
        <input className="form-control" id="last_name" defaultValue={user.last_name} />
      </div>
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input className="form-control" id="email" defaultValue={user.email}/>
      </div>
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input className="password" id="password" defaultValue={user.password}/>
      </div>
      <div className="form-group">
        <button className="form-control btn btn-primary" type="submit">
          Submit
        </button>
      </div>
    </form>
  );
};

export const TriggerButton = ({ triggerText, buttonRef, showModal }) => {
  return (
    <button
      className="btn btn-lg btn-danger center modal-button"
      ref={buttonRef}
      onClick={showModal}
    >
      {triggerText}
    </button>
  );
};

export const Modal = ({
  onClickOutside,
  onKeyDown,
  modalRef,
  buttonRef,
  closeModal,
  onSubmit,
  user
}) => {
  console.log("the user in the modal is" , user)
  return ReactDOM.createPortal(
    <FocusTrap>
      <aside
        tag="aside"
        role="dialog"
        tabIndex="-1"
        aria-modal="true"
        className="modal-cover"
        onClick={onClickOutside}
        onKeyDown={onKeyDown}
      >
        <div className="modal-area" ref={modalRef}>
          <button
            ref={buttonRef}
            aria-label="Close Modal"
            aria-labelledby="close-modal"
            className="_modal-close"
            onClick={closeModal}
          >
            <span id="close-modal" className="_hide-visual">
              Close
            </span>
            <svg className="_modal-close-icon" viewBox="0 0 40 40">
              <path d="M 10,10 L 30,30 M 30,10 L 10,30" />
            </svg>
          </button>
          <div className="modal-body">
            <Form onSubmit={onSubmit} user={user} />
          </div>
        </div>
      </aside>
    </FocusTrap>,
    document.body
  );
};




export default UserContainer;
