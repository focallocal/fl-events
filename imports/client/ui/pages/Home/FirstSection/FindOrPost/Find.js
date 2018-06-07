import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import { FormGroup, Label, InputGroup, InputGroupAddon, Input, Button } from 'reactstrap'
import { geocodeByAddress, getLatLng } from 'react-places-autocomplete'
import getUserPosition, { storeUserLocation } from '/imports/client/utils/location/getUserPosition'

class Find extends Component {
  state = {
    error: null,
    isGettingLocation: false,
    userLocation: null,
    search: ''
  }

  componentDidMount () {
    this._isMounted = true
  }

  componentWillUnmount () {
    this._isMounted = false
  }

  render () {
    const {
      error,
      isGettingLocation,
      userLocation,
      search
    } = this.state

    if (userLocation) {
      return <Redirect to='/map' />
    }

    return (
      <FormGroup className='find-wrapper'>
        <Label for='find'>Find resources around the world.</Label>
        <InputGroup>
          <Input
            id='find'
            type='text'
            value={search}
            invalid={error}
            placeholder='Enter city, state or zipcode'
            onChange={this.handleSearch}
            onFocus={this.removeError}
            autoFocus
          />
          <InputGroupAddon addonType='append'>
            <Button onClick={this.findBySearch} disabled={isGettingLocation}>
              Find
            </Button>
          </InputGroupAddon>
        </InputGroup>
        {error && <div className='error-msg'>Couldn't find anything..</div>}
        <div className='divider'>Or</div>
        <div className='center'>
          <Button onClick={this.findByCurrentLocation}>
            Use Current Location
          </Button>
        </div>
      </FormGroup>
    )
  }
  handleSearch = ({ target }) => {
    this.setState({ search: target.value })
  }
  removeError = () => this.setState({ error: false })
  findBySearch = () => {
    const { search } = this.state
    if (search.trim().length > 0) {
      NProgress.set(0.4)
      this.setState({ isGettingLocation: true })
      geocodeByAddress(search)
        .then(results => getLatLng(results[0]))
        .then(({ lat, lng }) => {
          NProgress.done()
          storeUserLocation({ lat, lng })
          this.setState({ userLocation: true })
        })
        .catch(() => {
          NProgress.done()
          this.setState({ error: true, isGettingLocation: false })
        })
    } else {
      // If search with empty value
      this.setState({ error: true })
    }
  }
  findByCurrentLocation = () => {
    getUserPosition(this) // will update state with latLng/error object
  }
}

export default Find
