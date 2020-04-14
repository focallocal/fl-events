import BaseField from 'uniforms/BaseField'
import invariant from 'fbjs/lib/invariant'
import {createElement} from 'react'

import DateField from './DateField'
import InputField from './InputField'
import NumberField from './NumberField'
import SelectField from './SelectField'
import TimePicker from './TimePicker'

export default class AutoField extends BaseField {
    static displayName = 'AutoField';

    getChildContextName () {
      return this.context.uniforms.name
    }

    render () {
      const props = this.getFieldProps(undefined, {ensureValue: false})
      const { customType, fieldType } = props

      if (customType) {
        switch (customType) {
          case 'select': props.component = SelectField; break
          case 'textarea': props.component = InputField; break
          case 'number': props.component = InputField; break
          case 'timePicker': props.component = TimePicker; break
        }
      } else {
        switch (fieldType) {
          case Date: props.component = DateField; break
          case String: props.component = InputField; break
          case Number: props.component = NumberField; break
        }

        invariant(props.component, 'Unsupported field type: %s', props.fieldType.toString())
      }

      return createElement(props.component, this.props)
    }
}
