import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import styles from './style.css';

class Thanks extends Component {
  state = {
    redirect: false
  };

  componentDidMount() {
    this.timeout = setTimeout(() => this.setState({ redirect: true }), 10000);
  }

  omponentWillUnmount() {
    clearTimeout(this.timeout);
  }

  render() {
    const { redirect } = this.state;
    return redirect ? (
      <Redirect to="/" />
    ) : (
      <div className={`ui fluid container ${styles.surveyChartContainer}`}>
        <div className="ui padded grid ">
          <div className="sixteen wide column">
            <div className={`ui very padded segment ${styles.topContainer}`}>
              <div className={styles.absoluteCenter}>
                <h1
                  className={`ui centered inverted header ${styles.fontBold}`}
                >
                  Thank You for your Feedback
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Thanks;
