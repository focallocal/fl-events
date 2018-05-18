import React, { Component } from 'react'
import { Meteor } from 'meteor/meteor'
import { withRouter, Route } from 'react-router-dom'
import { Button } from 'reactstrap'
import NewEventModal from '/imports/client/ui/components/NewEventModal'
import './styles.scss'

const queryStringToOpenModal = '?new=1'
const queryStringToCloseModal = '?new=0'

class NewEvent extends Component {
  render () {
    return (
      <div id='map--new-event'>
        <Button className='circle' onClick={this.openModal}>
          <i className='fas fa-plus' />
        </Button>
        <Route path='/map' render={({ location }) => {
          const isOpen = location.search.startsWith(queryStringToOpenModal)

          return (
            <NewEventModal
              isOpen={isOpen}
              toggleModal={this.closeModal}
            />
          )
        }} />
      </div>
    )
  }

  openModal = () => {
    // Allow modal only for users
    const route = '/map' + queryStringToOpenModal

    if (!Meteor.userId()) {
      sessionStorage.setItem('redirect', route)
      this.props.history.push('/sign-in')
    } else {
      this.props.history.push(route)
    }
  }

  closeModal = () => {
    this.props.history.push(queryStringToCloseModal)
  }
}

export default withRouter(NewEvent)
export {
  // For testing purposes
  queryStringToOpenModal,
  queryStringToCloseModal
}
