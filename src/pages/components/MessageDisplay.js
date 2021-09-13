import React from "react";

import "./MessageDisplay.css"
import {CloseButton} from "react-bootstrap";

const messages = [];
let messageChangeListener = (messages) => {};

/**
 * Add message to the message queue.
 * @param message The message text to display
 * @param className The CSS class name that will be used for the message
 * @param duration The duration the message should appear for (in ms)
 */
function addMessage(message, className, duration) {
    message = {message, className, timeoutID: -1}

    // Create timeout to remove message on duration end
    message.timeoutID = setTimeout(() => {
        let idx = -1;
        for (let i = 0; i < messages.length; i++)
            if (messages[i] === message)
                removeMessage(i);
        removeMessage(idx);
    }, duration);

    messages.push(message);
    messageChangeListener(getMessages());
}

function removeMessage(idx) {
    if (idx >= 0 && idx < messages.length) {
        // Set fadeOut boolean to start fading out the message
        const message = messages[idx];
        message.fadeOut = true;
        clearTimeout(message.timeoutID);
        messageChangeListener(getMessages());

        message.timeoutID = setTimeout(() => {
            messages.splice(idx, 1);
            messageChangeListener(getMessages());
        }, 500);
    }
}

function getMessages() {
    return messages;
}



class MessageDisplay extends React.Component {
    render() {
        const messages = getMessages();
        const toDisplay = messages.map((message, idx) => {
            // Fade message in or out depending on whether message.fadeOut is set
            let className = "message " + message.className;
            if (message.fadeOut)
                className += " fade-out"
            else
                className += " fade-in"

            return (
                <div className={className} key={message.timeoutID}>
                    <div className="status-indicator"/>
                    <span className="content">{message.message}</span>
                    <CloseButton onClick={() => {removeMessage(idx)}}/>
                </div>
            )
        });
        // Reverse the list so newest is at the top
        toDisplay.reverse();

        return (
            <article className="messages">
                {toDisplay}
            </article>
        );
    }

    onMessageChange(messages) {
        this.setState({
            messages
        });
    }

    componentDidMount() {
        messageChangeListener = (messages) => this.onMessageChange(messages);
        this.componentWillUnmount = () => {
            messageChangeListener = (messages) => {};
        }
    }
}

export default MessageDisplay;
export {addMessage, removeMessage, getMessages};
