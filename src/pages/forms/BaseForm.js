import React from "react";
import {Form} from "react-bootstrap";
import PropTypes from "prop-types";

/**
 * Class handling base form behaviour for this program.
 * Use in place of a normal form tag.
 * Requires an onSubmit function which takes a data object as an argument.
 */
export class BaseForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            validated: false
        }
    }

    handleChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });

        if (this.props.onChange) {
            this.props.onChange(event)
        }
    }

    handleSubmit(event) {
        const form = event.currentTarget;
        event.preventDefault();
        event.stopPropagation();
        this.setState({
            validated: true
        });

        // Return if form does not validate correctly
        if (!form.checkValidity())
            return

        if (this.props.onSubmit) {
            const data = {};
            const forbiddenKeys = ["validated"]

            // Ignore keys we dont need
            for (const key in this.state) {
                if (this.state.hasOwnProperty(key) && !forbiddenKeys.includes(key)) {
                    if (this.state[key]) {
                        // Move data into new data object for submission
                        data[key] = this.state[key];
                    }
                }
            }
            this.props.onSubmit(data);
            this.handleReset();
        }
    }

    handleReset(event) {
        this.setState({
            validated: false
        })

        if (this.props.onReset)
            this.props.onReset(event)
    }

    render() {
        return (
            <Form
                noValidate
                validated={this.state.validated}

                id={this.props.id}
                className={this.props.className}
                style={this.props.style}

                onSubmit={event => this.handleSubmit(event)}
                onChange={event => this.handleChange(event)}
                onReset={event => this.handleReset(event)}
            >
                {this.props.children}
            </Form>
        );
    }
}

BaseForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    onChange: PropTypes.func,
    onReset: PropTypes.func,

    id: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object
}

BaseForm.defaultProps = {
    className: "flex flex-column flex-center"
}
