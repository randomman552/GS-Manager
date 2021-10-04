import {ClipLoader} from "react-spinners";
import PropTypes from "prop-types";
import React from "react";
import {NotFoundPage} from "./NotFoundPage";

/**
 * React component designed to wrap a component and prevent it from being rendered until data is loaded for it.
 */
export class LoaderWrapper extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            timeout: false
        }
    }


    render() {
        if (!this.props.condition) {
            if (this.state.timeout) {
                return (
                    <>
                        {this.props.timeoutComponent}
                    </>
                )
            }
            return (
                <article className="page flex-center p-4">
                    <ClipLoader size={100}/>
                </article>
            )
        }

        return (
                <>
                    {this.props.children}
                </>
            );
    }

    componentDidMount() {
        if (this.props.timeout !== -1) {
            this.timeoutID = setTimeout(() => {
                this.setState({
                    timeout: true
                });
            }, this.props.timeout);
        }
    }

    componentWillUnmount() {
        if (this.timeoutID)
            clearTimeout(this.timeoutID);
    }
}

LoaderWrapper.propTypes = {
    /**
     * If this evaluates to true, the children that this component wraps will be rendered instead of a loading spinner.
     */
    condition: PropTypes.bool.isRequired,
    children: PropTypes.arrayOf(PropTypes.node),

    /**
     * Period to wait before assuming the required data is not available.
     * Set to -1 to prevent the timeout from occurring.
     * Default value is -1.
     * When timeout expires, the timeoutComponent is rendered.
     */
    timeout: PropTypes.number,
    timeoutComponent: PropTypes.node
}

LoaderWrapper.defaultProps = {
    condition: true,
    timeout: -1,
    timeoutComponent: <NotFoundPage/>
}
