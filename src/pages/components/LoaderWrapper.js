import {ClipLoader} from "react-spinners";
import PropTypes from "prop-types";
import React from "react";
import {NotFoundPage} from "./NotFoundPage";

/**
 * React component designed to wrap a component and prevent it from being rendered until data is loaded for it.
 * If data fails to load, a specified failure component can be rendered.
 * A timeout can be specified to automatically render the failure component after the duration expires.
 */
export class LoaderWrapper extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            timeout: false
        }
    }


    render() {
        // Awaiting render condition
        if (!this.props.render) {
            // If timeout has expired or failure prop has been set, render the failure component
            if (this.state.timeout || this.props.failed) {
                return (
                    <>
                        {this.props.failComponent}
                    </>
                )
            }
            return (
                <article className={this.props.className}>
                    <ClipLoader size={100}/>
                </article>
            )
        }

        // Render as normal
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
    render: PropTypes.bool.isRequired,
    children: PropTypes.arrayOf(PropTypes.node),

    /**
     * If this evaluates to true, the failComponent attribute is rendered instead of the children of this component.
     * This defaults to a 404 page.
     */
    failed: PropTypes.bool,
    /**
     * Period to wait before assuming the required data is not available (in ms).
     * Set to -1 to prevent the timeout from occurring.
     * Default value is -1.
     * When timeout expires, the failComponent is rendered.
     */
    timeout: PropTypes.number,
    failComponent: PropTypes.node,
    className: PropTypes.string
}

LoaderWrapper.defaultProps = {
    render: true,
    failed: false,
    timeout: -1,
    className: "page flex-center p-4",
    failComponent: <NotFoundPage/>
}
