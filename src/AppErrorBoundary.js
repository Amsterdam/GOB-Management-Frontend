import React from "react";
import {lastAPIError} from "./services/api_guard";
import {Button} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTimes} from "@fortawesome/free-solid-svg-icons";

class AppErrorBoundary extends React.Component {
    interval = null

    state = {
        hasError: false,
        errorInfo: null
    }

    componentDidMount() {
        this.interval = setInterval(
            () => this.checkAPI(),
            2500)
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    checkAPI = () => {
        if (lastAPIError.error && !this.state.hasError) {
            this.setState({
                hasError: true,
                errorInfo: lastAPIError.text
            })
        }
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return {hasError: true};
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        this.setState({hasError:true, errorInfo})
    }

    closeError = () => {
        lastAPIError.error = null;
        lastAPIError.text = null;
        this.setState({hasError: false, errorInfo: null})
    }

    render() {
        if (this.state.hasError) {
            return (
                <div>
                    <div className="errors">
                        <div className="float-right">
                            <Button title="Sluit foutmelding"
                                    variant="light"
                                    size="sm" className="small errors mt-n1">
                                <FontAwesomeIcon icon={faTimes} onClick={this.closeError}/>
                            </Button>
                        </div>
                        <div className="text-center errors">
                            FOUT: {this.state.errorInfo}
                        </div>
                    </div>
                    {this.props.children}
                </div>
            )
        } else {
            return this.props.children
        }
    }
}

export default AppErrorBoundary;