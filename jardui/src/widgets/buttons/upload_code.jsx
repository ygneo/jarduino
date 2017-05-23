import React from 'react'


class UploadCodeToDeviceButton extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            "enabled": props.enabled
        }
        this.handleClick = this.handleClick.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            "enabled": nextProps.enabled
        })
    }


    handleClick(e) {
        if (this.state.enabled) {
            this.props.onClick();
        }
    }

    render () {
        let uploadButtonClassName = "disabled"

        if (this.state.enabled === true) {
            uploadButtonClassName = "enabled"
        }

        return (
            <button
                type="button"
                className={uploadButtonClassName}
                onClick={this.handleClick}
            >REPROGRAMAR</button>
        )
    }
}

export default UploadCodeToDeviceButton
