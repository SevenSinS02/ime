import React, { Component, Fragment } from 'react';
import { Redirect } from 'react-router-dom';
import Modal from 'react-modal';
import { CSSTransition } from 'react-transition-group';
import Keyboard from 'react-simple-keyboard';
import { Bar } from 'react-chartjs-2';
import PieChart from '../PieChart';
import SurveyChart from '../SurveyChart';
import Chart from '../Chart';

import styles from './style.css';
import { client } from './services';

import bg from '../images/bg-Q1.png';
import slide from '../images/slide_bar-without_selection.png';
import yesSlide from '../images/slide_bar-selected_yes.png';
import noSlide from '../images/slide_bar-selected_no.png';
import slider from '../images/slider-white.png';
import yesSlider from '../images/Slider-green.png';
import noSlider from '../images/slider-red.png';
import listen from '../images/icons8_International_Music_96px_1.png';
import think from '../images/icons8_Thinking_Male_96px_1.png';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    width: '75%',
    backgroundColor: '#cf7500',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    padding: 0,
    borderRadius: '.5rem'
  }
};

const customStyle = {
  content: {
    top: '40%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    width: '50%',
    backgroundColor: '#cf7500',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    padding: '1rem',
    borderRadius: '.5rem'
  }
};

function validateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

Modal.setAppElement('#root');

class Survey1 extends Component {
  state = {
    layoutName: 'default',
    visible: false,
    inputName: 'name',
    shouldRedirect: false,
    total: 0,
    disabled: true,
    question: '',
    modalIsOpen: false,
    census: '',
    error: '',
    chart: '',
    user: '',
    data: {
      name: '',
      email: '',
      comment: '',
      questionOne: 'Should you be able to download and/or stream music for free?',
      questionTwo:
        "Who should have the maximunm rights over a piece of music, and consequently get a lion's share of the proceeds",
      answerTwo: [
        { value: 15, title: 'MUSIC COMPOSER' },
        { value: 15, title: 'LYRICIST' },
        { value: 15, title: 'SINGER' },
        { value: 15, title: 'INSTRUMENT PLAYERS' },
        {
          value: 15,
          title: 'PRODUCER (THE ONE WHO PAYS)'
        },
        { value: 15, title: 'DISTRIBUTION CHANNEL' },
        { value: 10, title: 'ME, THE LISTENER!' }
      ]
    }
  };

  async componentDidMount() {
    try {
      const census = await client.getAll();
      const total = parseInt(census[0].count_yes) + parseInt(census[0].count_no);
      console.log(total);
      this.setState({
        census: {
          yes: (census[0].count_yes / total) * 100,
          no: (census[0].count_no / total) * 100
        },
        data: this.props.data,
        user: this.props.user
      });
    } catch (err) {
      console.log(err);
    }
  }

  chartHandler = (res) => {
    const { data } = this.state;
    data.answerTwo = [...res];
    this.setState({
      data
    });
  };

  clickHandler = async (evt) => {
    const { value } = evt.target;
    const name = evt.target.name || evt.currentTarget.getAttribute('name');
    const { data, question, user } = this.state;
    const { history } = this.props;

    if (name === 'next' && question === 'choice') {
      this.setState({
        modalIsOpen: false,
        question: 'chart'
      });
      return;
    }

    if (name === 'next' && question === 'pie') {
      this.setState({ modalIsOpen: true, question: '' });
      return;
    }

    if (name === 'continue') {
      this.setState({ modalIsOpen: true, question: '' });
      return;
    }

    if (name === 'nope') {
      this.setState({ modalIsOpen: false, question: '' }, () => history.push('/thanks'));
      return;
    }

    if (name === 'user') {
      console.log('asd');
      const name = !!data.name;
      const email = validateEmail(data.email);
      const error = { name, email };
      if (!error.email || !error.name) {
        this.setState({
          error
        });
        return;
      }
      try {
        await client.update({ ...data, id: user });
        this.setState({ modalIsOpen: false, question: '', error }, () => history.push('/thanks'));
        return;
      } catch (err) {
        console.log(err);
      }
    }

    if (name === 'back' && question == 'choice') {
      this.setState({ question: 'choice', modalIsOpen: false });
      return;
    }

    if (name === 'back' && question == '') {
      console.log('alert');
      this.props.setClass('alert');
      history.push('/survey2');
      return;
    }
    if (name === 'user' && question === 'chart' && data.comment) {
      const status = validateEmail(data.email);
      if (!status) return;
      try {
        const user = await client.create(data);
        this.setState({ shouldRedirect: true, user: user.id });
      } catch (err) {
        console.log(err);
      }
      return this.setState({ data });
    }
    if (name && value) {
      data.answerOne = value;
      this.setState({
        data,

        disabled: false
      });
      return;
    }
    if (!data.answerOne) return;

    if (name === 'answer' && question === 'chart') {
      try {
        const census = await client.getChart();
        const found = Object.values(census[0]).filter((v) => v > 0);
        const user = await client.create(data);
        return this.setState({
          user: user.id,
          data,
          question: found.length ? 'pie' : '',
          modalIsOpen: true,

          chart: census[0]
        });
      } catch (err) {
        console.log(err);
        return;
      }
    }
    this.setState({
      question: 'choice',
      visible: true,
      modalIsOpen: true
    });
  };

  onChange = (input) => {
    const { data, inputName } = this.state;
    console.log(input, data, inputName);
    data[inputName] = input;
    this.setState({
      data
    });
  };

  onFocus = (evt) => this.setActiveInput(evt.target.name);

  setActiveInput = (inputName) => {
    this.setState({
      inputName
    });
  };

  onKeyPress = (button) => {
    console.log('Button pressed', button);

    /**
     * If you want to handle the shift and caps lock buttons
     */
    if (button === '{shift}' || button === '{lock}') this.handleShift();
  };

  handleShift = () => {
    const layoutName = this.state.layoutName;

    this.setState({
      layoutName: layoutName === 'default' ? 'shift' : 'default'
    });
  };

  onChangeAll = (inputObj) => {
    const { data } = this.state;
    console.log(data, inputObj);
    this.setState({
      data: { ...data, ...inputObj }
    });
  };

  onChangeInput = (event) => {
    const { data } = this.state;
    const { name, value } = event.target;
    data[name] = value;
    this.setState(
      {
        data
      },
      () => {
        this.keyboard.setInput(value);
      }
    );
  };

  closeModal = () => {
    this.setState({
      modalIsOpen: false
    });
  };

  redirectPath = () => '/';

  render() {
    const {
      question,
      modalIsOpen,
      data,
      inputName,
      layoutName,
      error,
      census,
      chart,
      visible,
      shouldRedirect
    } = this.state;

    if (shouldRedirect) {
      return <Redirect to={this.redirectPath()} />;
    }
    return (
      <Fragment>
        <div className="ui padded center aligned grid">
          <div className="sixteen wide column" style={{ padding: 0 }}>
            <div className={`ui very padded segment ${styles.surveyChartContainer}`}>
              <button
                type="button"
                className="circular ui left floated icon button"
                style={{ background: 'rgba(255,255,255,0.1)' }}
                name="back"
                onClick={this.clickHandler}
              >
                <i className="blue left chevron icon" />
              </button>
              <h1 className={`ui inverted header ${styles.surveyQuestion}`}>
                We would love to keep in touch for future updates.
              </h1>
              <form
                className={
                  error ? `ui large form error ${styles.forms}` : `ui large form  ${styles.forms}`
                }
              >
                <div className={!error.name ? 'field error' : 'field'}>
                  <input
                    className={styles.font}
                    type="text"
                    name="name"
                    value={data.name}
                    onFocus={this.onFocus}
                    onChange={this.onChangeInput}
                    placeholder="Full Name"
                    required
                  />
                </div>
                <div className={!error.email ? 'field error' : 'field'}>
                  <input
                    className={styles.font}
                    type="email"
                    name="email"
                    value={data.email}
                    onFocus={this.onFocus}
                    onChange={this.onChangeInput}
                    placeholder="Email Address"
                    required
                  />
                </div>
                <div className="ui error inverted red message">
                  <p className={styles.font}>
                    {!error.email || !error.name
                      ? 'Please Enter Your Name and a valid Email Address.'
                      : !error.email
                      ? 'Please Enter a valid Email Address.'
                      : 'Please Enter Your Name.'}
                  </p>
                </div>
              </form>
            </div>

            <div className={styles.proceedButtonWrapper}>
              <button
                className={`ui left floated massive button ${styles.skipButton}`}
                type="button"
                name="nope"
                onClick={this.clickHandler}
              >
                Skip
              </button>
              <button
                className={`ui right floated teal huge button ${styles.submitCommentButton}`}
                type="button"
                name="user"
                onClick={this.clickHandler}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
        <Keyboard
          ref={(r) => (this.keyboard = r)}
          inputName={inputName}
          layoutName={layoutName}
          onChangeAll={(inputObj) => this.onChangeAll(inputObj)}
          onKeyPress={(button) => this.onKeyPress(button)}
        />
      </Fragment>
    );
  }
}

export default Survey1;
