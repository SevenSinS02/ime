import React, { Component } from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import App from './containers/App';
import Landing from './src/Landing';
import Survey from './src/Survey';
import Survey2 from './src/Survey2';
import Survey1 from './src/Survey1';
import Survey4 from './src/Survey4';
import Survey3 from './src/Survey3';
import Thanks from './src/Thanks';

const NoMatch = ({ location }) => (
  <div className="ui inverted red raised very padded text container segment">
    <strong>Error!</strong> No route found matching:
    <div className="ui inverted black segment">
      <code>{location.pathname}</code>
    </div>
  </div>
);

class Routes extends Component {
  state = {
    user: '',
    cl: 'fade',
    data: {
      name: '',
      email: '',
      comment: '',
      questionOne:
        'Should you be able to download and/or stream music for free?',
      answerOne: '',
      questionTwo:
        "Who should have the maximunm rights over a piece of music, and consequently get a lion's share of the proceeds",
      answerTwo: [
        { value: '15', title: 'MUSIC COMPOSER' },
        { value: '15', title: 'LYRICIST' },
        { value: '15', title: 'SINGER' },
        { value: '15', title: 'INSTRUMENT PLAYERS' },
        {
          value: '15',
          title: 'PRODUCER (THE ONE WHO PAYS)'
        },
        { value: '15', title: 'DISTRIBUTION CHANNEL' },
        { value: '10', title: 'ME, THE LISTENER!' }
      ]
    }
  };

  setData = data => {
    console.log(data);
    this.setState({
      data
    });
  };

  setClass = cl => {
    console.log(cl);
    this.setState({
      cl
    });
  };

  setUser = user => {
    console.log(user);
    this.setState({
      user
    });
  };

  render() {
    return (
      <App>
        <div style={{ position: 'relative', height: '100vh', width: '100vw' }}>
          <Route key="/" exact path="/">
            {({ match, history }) => (
              <CSSTransition
                in={match != null}
                timeout={450}
                classNames={this.state.cl}
                unmountOnExit
              >
                <div className="fade">
                  <Landing />
                </div>
              </CSSTransition>
            )}
          </Route>
          <Route key="/survey" exact path="/survey">
            {props => (
              <CSSTransition
                in={props.match != null}
                timeout={450}
                classNames={this.state.cl}
                unmountOnExit
              >
                <div className="fade">
                  <Survey
                    {...props}
                    setData={this.setData}
                    setClass={this.setClass}
                  />
                </div>
              </CSSTransition>
            )}
          </Route>
          <Route key="/survey2" exact path="/survey2">
            {props => (
              <CSSTransition
                in={props.match != null}
                timeout={450}
                classNames="slide"
                unmountOnExit
              >
                <div className="fade">
                  <Survey2
                    {...props}
                    setData={this.setData}
                    setUser={this.setUser}
                    setClass={this.setClass}
                    data={this.state.data}
                  />
                </div>
              </CSSTransition>
            )}
          </Route>
          <Route key="/survey1" exact path="/survey1">
            {props => (
              <CSSTransition
                in={props.match != null}
                timeout={450}
                classNames={this.state.cl}
                unmountOnExit
              >
                <div className="fade">
                  <Survey1
                    {...props}
                    user={this.state.user}
                    data={this.state.data}
                    setClass={this.setClass}
                  />
                </div>
              </CSSTransition>
            )}
          </Route>
          <Route key="/pie" exact path="/pie">
            {props => (
              <CSSTransition
                in={props.match != null}
                timeout={450}
                classNames={this.state.cl}
                unmountOnExit
              >
                <div className="fade">
                  <Survey3
                    {...props}
                    user={this.state.user}
                    data={this.state.data}
                    setData={this.setData}
                    setClass={this.setClass}
                  />
                </div>
              </CSSTransition>
            )}
          </Route>
          <Route key="/census" exact path="/census">
            {props => (
              <CSSTransition
                in={props.match != null}
                timeout={450}
                classNames={this.state.cl}
                unmountOnExit
              >
                <div className="fade">
                  <Survey4
                    {...props}
                    setData={this.setData}
                    setClass={this.setClass}
                  />
                </div>
              </CSSTransition>
            )}
          </Route>
          <Route key="/thanks" exact path="/thanks">
            {props => (
              <CSSTransition
                in={props.match != null}
                timeout={450}
                classNames="fade"
                unmountOnExit
              >
                <div className="fade">
                  <Thanks {...props} setData={this.setData} />
                </div>
              </CSSTransition>
            )}
          </Route>
        </div>
      </App>
    );
  }
}

export default Routes;
