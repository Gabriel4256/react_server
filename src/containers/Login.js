import React from 'react';
import {Authentication} from 'components';
import {connect } from 'react-redux';
import {loginRequest} from 'modules/authentication';
//import {browserHistory} from 'react-router';

class Login extends React.Component{
	constructor(props){
		super(props);
		this.handleLogin = this.handleLogin.bind(this);
	}

	handleLogin(id, pw){
		return this.props.loginRequest(id, pw).then(
			()=>{
				if(this.props.status === "SUCCESS"){
					let loginData = {
						isLoggedIn: true,
						id
					};

					document.cookie = 'keys=' + btoa(JSON.stringify(loginData));

					Materialize.toast('Welcome, ' + id + '!', 2000);
					this.props.history.push('/');
					return true;
				} else{
					let $toastContent = $('<span style="color: $FFB4BA">Incorrect username or password</span>');
					Materialize.toast($toastContent, 2000);
					return false;
				}
			}
		)
	}

	render(){
		return (
			<div>
				<Authentication mode={"Login"}
					onLogin={this.handleLogin}/>
			</div>
		);
    }	
}

const mapStateToProps = (state) => {
	return {
		status: state.authentication.getIn(['login','status'])
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		loginRequest: (id, pw)=>{
			return dispatch(loginRequest(id,pw));
		}
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);