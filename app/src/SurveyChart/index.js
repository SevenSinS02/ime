import React, { Component } from 'react';
import { Pie, Chart } from 'react-chartjs-2';
import 'chartjs-plugin-labels';

const SurveyChart = (props) => {
  const chart = Object.values(props.chart);
  const data = {
    labels: [
      'LYRICIST',
      'PRODUCER (THE ONE WHO PAYS)',
      'DISTRIBUTION CHANNEL',
      'ME, THE LISTENER!',
      'INSTRUMENT PLAYERS',
      'MUSIC COMPOSER',
      'SINGER'
    ],
    datasets: [
      {
        data: chart,
        borderColor: 'transparent',
        backgroundColor: [
          '#FF1493',
          '#2185d0',
          '#32CD32',
          '#b5cc18',
          '#EE82EE',
          'orange',
          '#B413EC'
        ],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
      }
    ]
  };
  return (
    <Pie
      data={data}
      height={500}
      width={500}
      legend={{ display: false }}
      options={{
        maintainAspectRatio: false,
        plugins: {
          labels: [
            {
              render: 'percentage',
              position: 'border',
              fontColor: 'white',
              fontSize: 16,
              fontStyle: 'bold',
              precision: 0
            }
          ]
        }
      }}
    />
  );
};

export default SurveyChart;
