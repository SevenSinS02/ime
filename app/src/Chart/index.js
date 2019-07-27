import React, { Component } from 'react';
import DraggablePiechart from '../draggable';
import styles from './style.css';

class Chart extends Component {
  constructor(props) {
    super(props);
    this.elements = [];
    this.piechart = null;
    this.state = {
      data: [
        {
          proportion: 15,
          title: 'MUSIC COMPOSER',
          format: { color: 'orange', label: '1' }
        },
        {
          proportion: 15,
          title: 'LYRICIST',
          format: { color: '#FF1493', label: '2' }
        },
        {
          proportion: 15,
          title: 'SINGER',
          format: { color: '#B413EC', label: '3' }
        },
        {
          proportion: 15,
          title: 'INSTRUMENT PLAYERS',
          format: { color: '#EE82EE', label: '4' }
        },
        {
          proportion: 15,
          title: 'PRODUCER (THE ONE WHO PAYS)',
          format: { color: '#2185d0', label: '5' }
        },
        {
          proportion: 15,
          title: 'DISTRIBUTION CHANNEL',
          format: { color: '#32CD32', label: '6' }
        },
        {
          proportion: 10,
          title: 'ME, THE LISTENER!',
          format: { color: '#b5cc18', label: '7' }
        }
      ],
      barWidth: 0
    };
    this.setRef = element => {
      this.elements.push(element);
    };

    this.onPieChartChange = this.onPieChartChange.bind(this);
  }

  componentDidMount() {
    const { data } = this.state;
    this.piechart = new DraggablePiechart({
      canvas: document.getElementById('piechart'),
      proportions: data,
      onchange: this.onPieChartChange,
      minAngle: 0.1,
      collapsing: true
    });
    this.barWidth();
  }

  clickHandler = (index, operation) => {
    const { data } = this.state;
    console.log(this.piechart);
    if (operation === 'add' && data[index].proportion < 100) {
      data[index].proportion += 1;
      this.piechart.moveAngle(index, 1 * 0.1);
    } else if (operation === 'minus' && data[index].proportion >= 0) {
      data[index].proportion -= 1;
      this.piechart.moveAngle(index, -1 * 0.1);
    } else return;
    const res = data.map(d => ({
      title: d.title,
      value: d.proportion.toFixed(0)
    }));
    this.props.chartHandler(res);
    this.setState({
      data: [...data.slice(0, index), data[index], ...data.slice(index + 1)]
    });
  };

  async onPieChartChange(piechart) {
    const { data } = this.state;
    const percentages = await piechart.getAllSliceSizePercentages();
    const newData = data.map((d, index) => {
      d.proportion = percentages[index];
      return d;
    });
    const res = data.map(d => ({
      title: d.title,
      value: d.proportion.toFixed(0)
    }));
    this.props.chartHandler(res);
    this.setState({ data: newData });
  }

  barWidth = () => {
    console.log(this.elements);
    const { data } = this.state;
    const newData = data.map((d, index) => {
      const barWidth = this.elements[index].clientWidth;
      console.log(barWidth);
      d.width = barWidth;
      return d;
    });
    console.log(newData);
    this.setState({
      data: newData
    });
  };

  render() {
    const { data } = this.state;

    return (
      <div className="ui padded grid">
        <div className="eight wide column">
          {data.map((d, index) => (
            <div key={index} className={styles.wrapper}>
              <div
                style={{
                  marginRight: '1rem',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '2rem',
                  background: d.format.color,
                  borderRadius: '50%',
                  width: '3rem',
                  lineHeight: '3rem',
                  textAlign: 'center',
                  verticalAlign: 'middle'
                }}
              >
                {index + 1}
              </div>
              <div ref={this.setRef} className={styles.progressBar}>
                {d.title}
              </div>
            </div>
          ))}
        </div>
        <div className="eight wide center aligned column">
          <canvas id="piechart" width="800" height="800" />
        </div>
      </div>
    );
  }
}

export default Chart;
