import {OverlayTrigger, Tooltip} from "react-bootstrap";
import React, {useState} from "react";
import PropTypes from "prop-types";
import {ClarityIcons, infoStandardIcon, infoStandardIconName} from '@cds/core/icon';
import {CdsIcon} from "@cds/react/icon";
import "./InfoTooltip.css";

ClarityIcons.addIcons(infoStandardIcon);

export function InfoTooltip(props) {
    const [show, setShow] = useState(false);
    const [sticky, setSticky] = useState(false);
    const text = props.text;

    return (
        <OverlayTrigger
            placement="top"
            show={show || sticky}
            onToggle={(val) => {setShow(val)}}
            delay={{ show: 250, hide: 400 }}
            overlay={(props) => {
                return (
                    <Tooltip {...props}>
                        {text}
                    </Tooltip>
                )
            }}
        >
            <CdsIcon
                shape={infoStandardIconName}
                className={"tooltip-icon" + ((show || sticky) ? " active" : "")}
                onClick={() => {setSticky(!sticky)}}
            />
        </OverlayTrigger>
    )
}

InfoTooltip.propTypes = {
    text: PropTypes.string
}

InfoTooltip.defaultProps = {
    text: "This is a tooltip"
}
