import React from "react";
import auth from "../../services/auth";

class Auth extends React.Component {
    state = {
        userInfo: null
    }

    isAdmin() {
        return auth.isAdmin();
    }

    login() {
        auth.login();
    }

    logout() {
        auth.logout();
    }

    componentDidMount = async () => {
        const userInfo = await auth.userInfo();
        this.setState({userInfo})
    }

    render() {
        return (<div></div>);
    }
}

export default Auth;
