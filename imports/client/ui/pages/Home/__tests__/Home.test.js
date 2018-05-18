import React from 'react'
import { shallow } from 'enzyme'
import Home from '../index'
import FirstSection from '../FirstSection'

describe('<Home />', () => {
  const component = shallow(<Home />)

  it('should render', () => {

    expect(component.exists()).toBeTruthy()
  })

  it('should render all sections', () => {

    expect(component.find(FirstSection)).toHaveLength(1)
  })
})
