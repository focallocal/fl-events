import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { CustomInput, Row, Col, Button, Label } from 'reactstrap'
import AutoField from '/imports/client/utils/uniforms-custom/AutoField'
import ErrorField from '/imports/client/utils/uniforms-custom/ErrorField'
import Recurring from './DateTimeModule/Recurring'
import WeekDays from './DateTimeModule/WeekDays'
import VideoLink from './VideoLink'
import SameDateHours from './SameDateHours'

import i18n from '/imports/both/i18n/en'

let labels = i18n.NewEventModal


class SecondStep extends Component {
  constructor(props) {
    super(props)
    this.state = {
      videoLinksAdded: 0,
      openEndDate: this.props.form.getModel().categories.some(e => {
        return e.name === 'Community Offer' || e.name === 'Meet me for Action!'
      })
    }
  }
  render () {
    const { form } = this.props
    
    const RadioButton = this.RadioButton
    const VideoEntry = this.VideoEntry
    const VideoButtons = this.VideoButtons

    let { openEndDate, videoLinksAdded } = this.state
    const {
      days,
      multipleDays,
      repeat
    } = form.getModel().when

    return (
      <div id="second-step">
        <AutoField name="findHints" />
        <div className="dates-hours inline-inputs hide-labels">
          <div>
            <Row className="date-hours-box">
              <Col className="date-hours-coupled">
                <Label>Active from</Label>
                <div className="date-hours-single">
                  <AutoField name="when.startingDate" label={false} />
                  {/* {!multipleDays && <AutoField name="when.startingTime" />} */}
                  {!multipleDays && (
                    <AutoField
                      name="when.startingTime"
                      customType="timePicker"
                    />
                  )}
                </div>
              </Col>
              <Col className="date-hours-coupled">
                {!openEndDate && (
                  <Fragment>
                    {!repeat && (
                      <Fragment>
                        <Label>Active until</Label>
                        <div className="date-hours-single">
                          <AutoField
                            name="when.endingDate"
                            specialCat={this.props.form
                              .getModel()
                              .categories.some(e => {
                                return (
                                  e.name === 'Community Offer' ||
                                  e.name === 'Meet me for Action!'
                                );
                              })}
                          />
                          {!multipleDays && (
                            <AutoField
                              name="when.endingTime"
                              customType="timePicker"
                            />
                          )}
                        </div>
                      </Fragment>
                    )}
                    {repeat && (
                      <Fragment>
                        <Label className="large-only">&nbsp;</Label>
                        <div className="date-hours-single conditional-time">
                          <AutoField
                            name="when.endingTime"
                            customType="timePicker"
                          />
                        </div>
                      </Fragment>
                    )}
                  </Fragment>
                )}
                {!repeat && openEndDate && (
                  <Fragment>
                    <Label>Active until</Label>
                    <AutoField
                      name="when.endingDate"
                      openEndDate={true}
                      handleCalendarClick={this.resetEndDate}
                    />
                  </Fragment>
                )}
              </Col>
            </Row>
          </div>
        </div>

        {/* Weekdays  */}
        <RadioButton
          id="multipleDays"
          label={labels.recurrence.thirdRadio}
          value={multipleDays}
          type="radio"
        />
        {multipleDays && (
          <div className="week-days">
            <ErrorField
              name="when.days"
              errorMessage="Please select at least 1 day"
            />
            <SameDateHours form={form} schemaKey={'when.days'} />
            <WeekDays
              form={form}
              schemaKey={'when.days'}
              selectedDays={days || []}
            />
          </div>
        )}

        {/* Repetition */}
        <RadioButton
          id="repeat"
          label={labels.recurrence.fourthRadio}
          value={repeat}
          type="radio"
        />
        {repeat && <Recurring form={form} />}

        {/* Additional text description & attendee limit */}
        <AutoField className="pageDetails" name="description" />
        <AutoField className="pageDetails" name="engagement.limit" />

        {/* Add video link(s) */}
        <CustomInput
          className="videoToggle"
          id="includesVideo"
          type="radio"
          label={`${labels.video.title.firstLine}
                ${labels.video.title.secondLine}`}
          checked={videoLinksAdded > 0}
          onClick={this.toggleLinks}
        />
        {videoLinksAdded > 0 && <VideoEntry id={1} form={form} />}
        {videoLinksAdded > 1 && <VideoEntry id={2} form={form} />}
        {videoLinksAdded > 2 && <VideoEntry id={3} form={form} />}
        {videoLinksAdded > 0 && (
          <VideoButtons
            videoLinksAdded={videoLinksAdded}
            addLink={this.addLink}
            removeLink={this.removeLink}
          />
        )}
      </div>
    );
  }

  toggleLinks = () => {
    if (this.state.videoLinksAdded === 0) {
      this.setState({ videoLinksAdded: 1 })
    } else {
      this.setState({ videoLinksAdded: 0 })
      // formModel.resetVideoArray(this.props.form)
    }
  }

  addLink = () => {
    this.setState({ videoLinksAdded: this.state.videoLinksAdded + 1 })
  }

  removeLink = () => {
    this.setState({ videoLinksAdded: this.state.videoLinksAdded - 1 })
  }

  resetEndDate = () => {
    // NOTE: for special category events, this resets their ending date to standard
    this.setState({ openEndDate: false })
  }

  // DESC: Node fragment that point to VideoLink component
  // This includes entry fields for hostname and url
  // Also includes error that displays when url is incorrect on submit
  VideoEntry = ({ id, form }) => (
    <Fragment>
      <VideoLink
        form={form}
        linkId={id}
        name={`video.link${id}`}
      />
      <ErrorField
        name={`video.link${id}.address`}
        errorMessage='Invalid URL, please ensure it conforms to the example shown'
      />
    </Fragment>
  )

  // DESC: Node fragment to add/remove video buttons
  VideoButtons = ({ videoLinksAdded, addLink, removeLink }) => (
    <div className='videoButtons'>
      <Button
        outline
        color='secondary'
        className='addLink'
        onClick={addLink}
        disabled={videoLinksAdded > 2}
      >
        Add Another Link
      </Button>
      <Button
        outline
        color='secondary'
        className='removeLink'
        onClick={removeLink}
      >
        Remove Last Link
      </Button>
    </div>
  )

  RadioButton = ({ label, id, value, type }) => (
    <CustomInput
      id={id}
      type={type}
      label={label}
      checked={value === undefined ? false : value}
      onChange={() => {}}
      onClick={() => this.handleRadioButton(id, !value)}
    />
  )

  handleRadioButton = (type, value) => {
    const { when } = this.props.form.getModel()

    this.props.form.change('when', {
      ...when,
      multipleDays: type === 'multipleDays' ? value : false,
      repeat: type === 'repeat' ? value : false
    })

    // Scroll to bottom of modal
    setTimeout(() => {
      const modal = document.querySelector('.modal-body')
      modal.scrollTo(modal, 375)
    }, 1)
  }
}

SecondStep.propTypes = {
  form: PropTypes.object
}

export default SecondStep
