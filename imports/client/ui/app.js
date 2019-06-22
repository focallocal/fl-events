import { hot } from "react-hot-loader";
import { Meteor } from "meteor/meteor";
import React, { Component, Fragment } from "react";
import { Router, Route, Redirect } from "react-router-dom";
import history from "../utils/history";
import qs from "query-string";

// DOCUSS
import "./style.scss";
import { dcs } from "/imports/client/utils/dcs-master";
const discourseUrl = "https://discuss.focallocal.org/";
//const discourseUrl = 'http://vps465971.ovh.net:3000'

// Includes
import MainMenu from "./includes/MainMenu";

// Pages
import Home from "./pages/Home";
import Whitepaper from "./pages/WhitePaper";
import Team from "./pages/TeamMembers";
import Faq from "./pages/Faq";
import Partners from "./pages/Partners";
import About from "./pages/About";
import Authentication from "./pages/Authentication";
import Map_ from "./pages/Map";
import NewEventLoadable from "./pages/NewEvent/loadable";
import CongratsModal from "./pages/NewEvent/CongratsModal";
import Page from "./pages/Page";
import { Error404 } from "./pages/Errors";

import WPIntro from "./pages/WhitePaper/Intro";
import WPWhy from "./pages/WhitePaper/Why";
import WPFAQs from "./pages/WhitePaper/faqs"; 

// Components
import ScrollToTop from "./components/ScrollToTop";
import Admin from "./pages/Admin/index"

class App extends Component {
  constructor() {
    super();
    // DOCUSS
    this.state = {
      showRightPanel: false,
      balloonId: false,
      dcsTags: null,
      leftRightTransition: false
    };
  }

  componentDidMount() {
    // Add the touch-screen flag to the <html> tag
    const touchScreen =
      !!("ontouchstart" in window) || window.navigator.msMaxTouchPoints > 0;
    if (touchScreen) {
      document.documentElement.classList.add("touch-screen");
    }

    setTimeout(() => {
      document.querySelector("#root").classList.toggle("show");
    }, 100); // add a fading effect on the inital loading

    // Hide the ghost when transition is over
    const dcsGhost = document.getElementById("dcs-ghost");
    dcsGhost.addEventListener("transitionend", () => {
      this.setState({ leftRightTransition: false });
    });

    // Connect to the plugin in Discourse
    dcs
      .connect({
        discourseWindow: document.getElementById("dcs-right").contentWindow,
        discourseOrigin: new URL(discourseUrl).origin,
        timeout: 15000
      })
      .catch(err => {
        // Timeout error
        console.log(err);
      });

    // Set up callbacks to handle Discourse route changes (when the user
    // clicks on something (ex: his profile) in Discourse)
    dcs.onHome(() => {
      this.triggeredByDiscourse = true;
      changeHistory({
        params: { r: "1", b: null, t: null, d: null },
        push: false
      });
    });
    dcs.onPath(path => {
      this.triggeredByDiscourse = true;
      changeHistory({
        params: { r: undefined, b: null, t: null, d: path },
        push: false
      });
    });
    dcs.onTagOrTopic((tag, topicId) => {
      if (tag.includes('whitepaper')) {
        changeHistory({
          pathname: "/whitepaper",
          params: { r: "1", b: tag.substring(17), t: topicId || null },
          push: false
        });
      } else {
        Meteor.call("Events.getEventId", { discourseTag: tag }, (err, res) => {
          if (err) {
            console.log("Events.getEventId Error:", err);
          } else {
            this.triggeredByDiscourse = true;
            changeHistory({
              pathname: "/page/" + res,
              params: { r: "1", b: tag.substring(17), t: topicId || null },
              push: false
            });
          }
        });
      }
    });

    // Setup callbacks to handle other Discourse events
    dcs.onUserChange(user => {
      //user && console.log('Unread notifications: ', user.unreadNotifications)
    });
    dcs.onDcsTags(dcsTags => {
      this.setState({ dcsTags });
    });

    // Update the Discourse route. DON'T DO THIS IMMEDIATELY, otherwise
    // transitions won't trigger between the two states
    setTimeout(() => {
      this.dcsUpdateFromUrl();
    }, 0);
    history.listen(() => {
      this.dcsUpdateFromUrl();
    });
  }

  dcsUpdateFromUrl() {
    const { r, b, t, d } = qs.parse(window.location.search);
    if (!this.triggeredByDiscourse) {
      // Required to no changing the route again
      if (t) {
        dcs.gotoTopic(t);
      } else if (b) {
        const prefix = "/page/";
        if (window.location.pathname.startsWith(prefix)) {
          const pageId = window.location.pathname.substring(prefix.length);
          const tag = "dcs-" + pageId.substring(0, 12).toLowerCase() + "-" + b;
          dcs.gotoTag(tag);
        } else if (window.location.pathname.startsWith('/')) {
          const pathname = window.location.pathname
          const endIndex = pathname.search('\\?') > -1 ? pathname.search('\\?') : pathname.length
          const tagLocation = pathname.slice(pathname.search('/') + 1, endIndex)
          const tag = "dcs-" + tagLocation + "-" + b
          dcs.gotoTag(tag)
        }
      } else if (d) {
        dcs.gotoPath(d);
      } else {
        dcs.gotoHome();
      }
    }
    this.triggeredByDiscourse = false;
    // Don't set leftRightTransition if you're not sure this will trigger a transition!
    const layoutChange =
      r !== this.state.showRightPanel || !!b !== !!this.state.balloonId;
    if (layoutChange) {
      this.setState({
        showRightPanel: r,
        balloonId: b,
        leftRightTransition: true
      });
    }
  }

  render() {
    let dcsClass = "";
    if (this.state.showRightPanel) {
      dcsClass += "dcs-show-right ";
    }
    if (this.state.balloonId) {
      dcsClass += "dcs-sel ";
    }

    const dcsProps = {
      dcsTags: this.state.dcsTags,
      dcsClick: this.dcsClick.bind(this)
    };

    const routePaths = {
      root: "/",
      home: "/home",
      team: "/team",
      partners: "/partners",
      whitepaper: "/whitepaper",
      faq: "/faq",
      about: "/about",
      map: "/map",
      admin: "/admin",
      thankyou: "/thank-you",
      page: "/page",
      signin: "/sign-in",
      signup: "/sign-up",
      change_password: "/change-password",
      forgot_password: "/forgot-password",
      sso_auth: "/sso_auth",

      whitepaper_intro: "/whitepaper/intro",
      whitepaper_why: "/whitepaper/why",
      whitepaper_faqs: "/whitepaper/faqs"
    }

    return (
      <div id="dcs-root" className={dcsClass}>
        <div
          id="dcs-ghost"
          style={{
            visibility: this.state.leftRightTransition ? "visible" : "hidden"
          }}
        >
          <div className="dcs-ghost-splitbar" />
        </div>

        <div id="dcs-left">
          <Router history={history}>
            <Fragment>
              <MainMenu />

              <ScrollToTop>
                <Route exact path={routePaths.root} component={Home} />
                <Route exact path={routePaths.home} component={Home} />
                <Route exact path={routePaths.team} render={props => <Team {...props} {...dcsProps} />} />
                <Route exact path={routePaths.partners} render={props => <Partners {...props} {...dcsProps} />} />
                <Route exact path={routePaths.whitepaper} render={props => <Whitepaper {...props} {...dcsProps} />} />
                <Route exact path={routePaths.faq} render={props => <Faq {...props} {...dcsProps} />}/>
                <Route exact path={routePaths.about} render={props => <About {...props} {...dcsProps} />}/>
                <Route path={routePaths.map} component={Map_} />
                <Route exact path={routePaths.admin} render={props => <Admin {...props}/>} /> 
                <Route exact path={routePaths.thankyou} component={CongratsModal} />
                <Route exact path={`${routePaths.page}/:id`} render={props => <Page {...props} {...dcsProps} />}/>

                <Route exact path={routePaths.whitepaper_intro} render={props => <WPIntro {...props} {...dcsProps} />} />
                <Route exact path={routePaths.whitepaper_why} render={props => <WPWhy {...props} {...dcsProps} />} />
                <Route exact path={routePaths.whitepaper_faqs} render={props => <WPFAQs {...props} {...dcsProps} />} />

                <Route path="*" render={() => this.check404Route(Object.values(routePaths))} />

                <Authentication />
              </ScrollToTop>
            </Fragment>
          </Router>
        </div>
        <div id="dcs-splitbar">
          <div id="dcs-logo">
            <img src="/images/dcs-logo.png" />
          </div>
          <div style={{ flex: "1 0 0" }} />
          <div id="dcs-splitbar-btn" onClick={this.onDcsSplitbarClick}>
            <div style={{ flex: "1 0 0" }} />
            <div id="dcs-splitbar-btn-text">&gt;</div>
            <div style={{ flex: "1 0 0" }} />
          </div>
          <div style={{ flex: "1 0 0" }} />
        </div>

        <iframe
          id="dcs-right"
          width="0"
          frameBorder="0"
          style={{ minWidth: 0 }}
          src={discourseUrl}
        />
      </div>
    );
  }

  onDcsSplitbarClick = () => {
    const showRightPanel = !this.state.showRightPanel;
    changeHistory({ params: { r: showRightPanel ? "1" : null }, push: true });
  };

  dcsClick(balloonId) {
    if (balloonId) {
      if (balloonId.length > 3 || balloonId.toLowerCase() !== balloonId) {
        throw new Error(`Invalid balloonId "${balloonId}"`);
      }
      changeHistory({
        params: { r: "1", b: balloonId, t: null, d: null },
        push: true
      });
    } else {
      changeHistory({
        params: { r: null, b: null, t: null, d: null },
        push: true
      });
    }
  }

  renderNewEvent = ({ location, history }) => {
    const { new: new_, edit } = qs.parse(location.search);
    const isOpen = Boolean(new_ === "1" || (edit === "1" && window.__editData));

    if (isOpen && !Meteor.userId()) {
      sessionStorage.setItem("redirect", "/?new=1");
      return <Redirect to="/sign-in" />;
    }
    /*
    else if(!isOpen){
      return <Redirect to='/home' />
    }
    */
    console.log('passed in loc:\n', location)
    console.log('passed in hist:\n', history)
    return (
      <NewEventLoadable isOpen={isOpen} location={location} history={history} />
    );
  };

  /**
   * This function manages the 'catch-all' route, serving two purposes.
   * (1) open a model to create/edit event when there is the appropriate search string in the URL
   * (2) for all other routes not specified, it will redirect to a 404 page
   * Ideally we should be using React-router Switch to create a fallback 404 page...
   * But this would require opening the new event modal without using the URL as a hook
   * And this may break interactions with Docus (e.g. editing an event directly from the forum)
   */ 
  check404Route = (routes) => {
    if (window.location.search === '?new=1' || window.location.search === '?edit=1') {
      return this.renderNewEvent({ location: window.location, history })
    }
    if (!routes.some(e => e === window.location.pathname)
      && !window.location.pathname.includes('/page/')
      && !window.location.pathname.includes('reset-password')) {
        return <Error404 />
    }
    return null
  }
}

export default hot(module)(App);

// A falsy pathname means the pathname won't be changed
// An undefined query params means the query param won't be changed
// A null query params means the query param will be removed
function changeHistory({ pathname = null, params, push }) {
  const p = Object.assign(params);
  Object.keys(p).forEach(key => p[key] === undefined && delete p[key]);
  const s = qs.parse(window.location.search);
  Object.assign(s, p);
  Object.keys(s).forEach(key => s[key] === null && delete s[key]);
  const search = qs.stringify(s);
  //############################################################################
  // TERRIBLE WORKAROUND FOR ISSUE https://github.com/focallocal/fl-maps/issues/742
  if (pathname && pathname !== location.pathname) {
    console.log("##########", pathname + "?" + search);
    location.href = pathname + "?" + search;
    return;
  }
  //############################################################################
  pathname = pathname || window.location.pathname;
  if (push) {
    history.push({ pathname, search });
  } else {
    history.replace({ pathname, search });
  }
}
