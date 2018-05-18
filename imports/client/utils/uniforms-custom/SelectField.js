import React from 'react'
import connectField from 'uniforms/connectField'
import Select from 'react-select'
import PlacesSearchBox from '/imports/client/ui/components/PlacesSearchBox'
import { formatReactSelectOptions } from '../format'

import { FormGroup, Label } from 'reactstrap'

const Select_ = ({
  allowedValues,
  id,
  label,
  name,
  onChange,
  placeholder_,
  value,
  selectOptions = {},
  error,
  ...props
}) => {
  const {
    multi,
    labelKey,
    labelMapper,
    defaultValueIndex,
    googleMaps
  } = selectOptions

  let options = []
  if (allowedValues) {
    options = formatReactSelectOptions(allowedValues, labelKey, labelMapper)
  }

  let values = formatReactSelectOptions(value, labelKey, labelMapper)

  // Due to how react-select works, we need to calculate the values (values are represented as indexes)
  values.forEach((val, index) => {
    values[index].value = options.findIndex(obj => obj.label === val.label)
  })

  return (
    <FormGroup className={`select-field ${error ? 'error' : ''}`}>
      <Label>{label}</Label>
      {!googleMaps ? (
        <Select
          value={values}
          options={options}
          isMulti={multi}
          onChange={value => onChange(getValue(allowedValues, value, multi))}
          placeholder={placeholder_}
        />
      ) : (
        <PlacesSearchBox
          onSelect={onChange}
          address={value ? value.name : null}
          placeholder={placeholder_}
        />
      )
      }
    </FormGroup>
  )
}

function getValue (options, value, isMulti) {
  /*
    React-Select returns values in the following format -> { value: '', label: '' }
    We must extract the value field so it can match our SimpleSchema defintion.
    The value is an index to the options array
  */

  if (isMulti) {
    const data = value.reduce((arr, val) => {
      return arr.concat(options[val.value])
    }, [])
    return data
  }

  return options[value.value]
}

function formatOptions (options = [], labelKey) {
  /*
    React-select expects an array of objects with the following format -> { value: '', label: '' }
    So we must ensure our array of options always match that format.
    # If valueKey and labelKey are undefined
      the options array we provide consist of primitive types.
    # We save the index of the option as the value so we can later retrieve it easily
      (react-select doesn't allow objects as values)
  */

  let options_ = options
  if (!options.reduce) {
    options_ = [options]
  }

  return options_.reduce(function (arr, option, index) {
    return arr.concat({
      value: index,
      label: labelKey ? option[labelKey] : option
    })
  }, [])
}

export default connectField(Select_)
