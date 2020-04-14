import React, { Component } from 'react';
import connectField from 'uniforms/connectField';
import { FormGroup, Label, Button, ButtonGroup } from 'reactstrap';

import { formatReactSelectOptions } from '../format';

class TimePicker_ extends Component {
  constructor(props) {
    super();
    const { labelKey, labelMapper } = props.selectOptions || {};

    this.state = {
      options: formatReactSelectOptions(
        props.allowedValues,
        labelKey,
        labelMapper
      ),
      index: props.allowedValues.indexOf(props.value)
    };
  }

  render() {
    const { value, error } = this.props;

    const className = 'select-field ' + (error ? 'error' : '');

    const buttonProps = {
      outline: true,
      color: 'secondary'
    };

    const clockProps = {
      color: 'secondary'
    };

    return (
      <FormGroup className={className}>
        <ButtonGroup className="time-box">
          <Button className="time-btn" {...buttonProps} onClick={this.decTime}>
            -
          </Button>
          <Label className="time-display" {...clockProps}>
            {value}
          </Label>
          <Button className="time-btn" {...buttonProps} onClick={this.incTime}>
            +
          </Button>
        </ButtonGroup>
      </FormGroup>
    );
  }

  incTime = () => {
    if (this.state.index === this.props.allowedValues.length - 1) {
      this.props.onChange(
        this.props.allowedValues[0]
      );
      this.setState({ index: 0 });
      return
    }
    this.props.onChange(this.props.allowedValues[this.state.index + 1]);
    this.setState({ index: this.state.index + 1 });
  };

  decTime = () => {
    if (this.state.index === 0) {
      this.props.onChange(
        this.props.allowedValues[this.props.allowedValues.length - 1]
      );
      this.setState({ index: this.props.allowedValues.length - 1 });
      return
    }
    this.props.onChange(this.props.allowedValues[this.state.index - 1]);
    this.setState({ index: this.state.index - 1 });
  };
}

export default connectField(TimePicker_);
