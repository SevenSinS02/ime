import React, { Component } from 'react';
import { Doughnut } from 'react-chartjs-2';
import 'chartjs-plugin-labels';
import styles from './style.css';

const PieChart = props => {
  const { census } = props;
  const chart = [census.yes, census.no];
  const data = {
    labels: ['YES', 'NO'],
    datasets: [
      {
        data: chart,
        borderColor: 'transparent',
        backgroundColor: ['#fff', '#FF6384']
      }
    ]
  };

  return (
    <div className={styles.chart}>
      <Doughnut
        data={data}
        width={500}
        height={500}
        legend={{ display: false }}
        options={{
          maintainAspectRatio: false,
          plugins: {
            labels: {
              render(args) {
                return `${args.label}\n${args.value.toFixed(0)}%`;
              },
              position: 'outside',
              fontColor: 'white',
              precision: 0,
              fontSize: 16,
              fontStyle: 'bold',
              textMargin: 14,
              outsidePadding: 18
            }
          }
        }}
      />
    </div>
  );
};

export default PieChart;
