import PropTypes from "prop-types";
import {buildStyles, CircularProgressbar} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "./UtilisationWidget.css"

export function UtilisationWidget(props) {
    const percentage = ((props.current - props.minimum) / (props.maximum - props.minimum)) * 100
    const label = (props.asPercent) ? Math.round(percentage * 10) / 10 + "%" : Math.round(props.current) + props.units;

    const minimumDisplay = (props.minimum) ? <p>Minimum: {Math.round(props.minimum)}{props.units}</p> : null

    return (
        <div className="utilisation-widget">
            <span className="title">{props.title}</span>
            <div className="text">
                <p>Current: {Math.round(props.current)}{props.units}</p>
                <p>Maximum: {Math.round(props.maximum)}{props.units}</p>
                {minimumDisplay}
            </div>
            <div className="circ-progress-container">
                <CircularProgressbar
                    value={percentage}
                    text={label}
                    circleRatio={0.75}
                    styles={buildStyles({
                        rotation: 1 / 2 + 1 / 8,
                        strokeLinecap: "butt",
                        trailColor: "#eee"
                    })}
                />
            </div>
        </div>
    )
}

UtilisationWidget.propTypes = {
    /**
     * Current utilisation of a resource.
     * Must be between the specified maximum or minimum.
     */
    current: PropTypes.number.isRequired,

    /**
     * Maximum utilisation.
     * Used to calculate the percentage utilisation to display.
     * Defaults to 100 (assumes current is a percentage)
     */
    maximum: PropTypes.number,

    /**
     * Minimum utilisation to scale to.
     * Used to calculate the percentage utilisation to display, will act as the lower scalar if provided.
     * Defaults to 0.
     */
    minimum: PropTypes.number,

    /**
     * If true, will display the percentage instead of the real value.
     * Otherwise the real value will be shown.
     * Defaults to true
     */
    asPercent: PropTypes.bool,

    /**
     * Units of the data displayed.
     * Displayed alongside the max and min values.
     */
    units: PropTypes.string,

    title: PropTypes.string
}

UtilisationWidget.defaultProps = {
    maximum: 100,
    minimum: 0,
    asPercent: true,
    title: "Utilisation",
    units: "%"
}