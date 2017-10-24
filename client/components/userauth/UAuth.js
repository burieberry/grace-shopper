import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { loginUser, setErrorAndClear } from '../../store';

class UserAuth extends Component {
  // can be presentational
  constructor() {
    super();
    this.state = { email: '', password: '' };
    this.onChange = this.onChange.bind(this);
    this.onLogin = this.onLogin.bind(this);
  }

  onChange(ev) {
    const { name, value } = ev.target;
    this.setState({ [name]: value });
  }

  onLogin(ev) {
    ev.preventDefault();
    const { email, password } = this.state;
    this.props.loginUser(email, password)
      .then(() => this.props.history.goBack())
      .catch(err => {
        if (err.response.data == 'password change required') return this.props.history.push('/changepassword');
        this.props.setErrorAndClear(err.response.data);
      })
  }

  render() {
    const { email, password } = this.state;
    const { onChange, onLogin } = this;

    return (
      <div className="col-xs-12 col-sm-10 col-md-8">
        <form className="well" onSubmit={ onLogin }>
          <h4>Account</h4>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input name="email" type="email" value={ email } onChange={ onChange } className="form-control" />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input name="password" type="password" value={ password } onChange={ onChange } className="form-control" />
          </div>
          <button className="btn btn-default">Login</button> or <Link to="/register">Register</Link>
        </form>
      </div>
    );
  }
}

const mapDispatch = { loginUser, setErrorAndClear };

export default withRouter(connect(null, mapDispatch)(UserAuth));
