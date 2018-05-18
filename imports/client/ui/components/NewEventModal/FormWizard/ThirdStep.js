import React from 'react'
import AutoField from '/imports/client/utils/uniforms-custom/AutoField'

const ThirdStep = ({ show }) => (
  <div style={{ display: show ? 'block' : 'none' }}>

    <AutoField name='overview' />
    <AutoField name='description' />
    <AutoField name='findHints' />

  </div>
)

export default ThirdStep
