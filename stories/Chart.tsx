import React, {
  MouseEvent,
  useRef,
  useState,
  useEffect,
  useReducer,
} from 'react';
import 'chart.js/auto';
import type { Chart as ChartJS, InteractionItem } from 'chart.js';
import 'chartjs-adapter-date-fns';
import {
  Chart,
  getDatasetAtEvent,
  getElementAtEvent,
  getElementsAtEvent,
} from '../src';
import * as multitypeChart from '../sandboxes/chart/multitype/App';
import * as eventsChart from '../sandboxes/chart/events/App';
import * as data from './Chart.data';

export default {
  title: 'Components/Chart',
  component: Chart,
  parameters: {
    layout: 'centered',
  },
  args: {
    width: 500,
    height: 400,
  },
};

export const MultiType = args => <Chart {...args} />;

MultiType.args = {
  data: multitypeChart.data,
};

export const Dynamic = args => {
  const [dynamicData, setDynamicData] = useState(data.getDynamicData);

  useEffect(() => {
    const interval = setInterval(
      () => setDynamicData(data.getDynamicData()),
      3000
    );

    return () => clearInterval(interval);
  }, []);

  return <Chart {...args} data={dynamicData} />;
};

Dynamic.args = {
  options: data.dynamicOptions,
};

export const ClickEvents = ({
  onDatasetClick,
  onElementClick,
  onElementsClick,
  options,
  data,
  ...args
}) => {
  const datasetAtEvent = (dataset: InteractionItem[]) => {
    if (!dataset.length) return;

    const datasetIndex = dataset[0].datasetIndex;

    onDatasetClick(data.datasets[datasetIndex].label);
  };

  const elementAtEvent = (element: InteractionItem[]) => {
    if (!element.length) return;

    const { datasetIndex, index } = element[0];

    onElementClick(data.labels[index], data.datasets[datasetIndex].data[index]);
  };

  const elementsAtEvent = (elements: InteractionItem[]) => {
    if (!elements.length) return;

    onElementsClick(elements);
  };

  const chartRef = useRef<ChartJS>(null);

  const onClick = (event: MouseEvent<HTMLCanvasElement>) => {
    const { current: chart } = chartRef;

    if (!chart) {
      return;
    }

    datasetAtEvent(getDatasetAtEvent(chart, event));
    elementAtEvent(getElementAtEvent(chart, event));
    elementsAtEvent(getElementsAtEvent(chart, event));
  };

  return (
    <Chart
      {...args}
      ref={chartRef}
      type='bar'
      options={options}
      data={data}
      onClick={onClick}
    />
  );
};

ClickEvents.args = {
  options: eventsChart.options,
  data: eventsChart.data,
};

ClickEvents.argTypes = {
  onDatasetClick: { action: 'dataset clicked' },
  onElementClick: { action: 'element clicked' },
  onElementsClick: { action: 'elements clicked' },
};

export const Redraw = args => <Chart {...args} />;

Redraw.args = {
  data: multitypeChart.data,
  redraw: true,
};

export const SameDataToggle = args => {
  const [currentData, toggleData] = useReducer(
    prevState =>
      prevState === data.sameData1 ? data.sameData2 : data.sameData1,
    data.sameData1
  );

  return <Chart {...args} data={currentData} onClick={toggleData} />;
};

SameDataToggle.args = {
  type: 'bar',
};

export const Decimation = args => {
  const [currentData, toggleData] = useReducer(
    data.getDecimationData,
    data.getDecimationData()
  );

  return <Chart {...args} data={currentData} onClick={toggleData} />;
};

Decimation.args = {
  type: 'line',
  options: data.decimationOptions,
};
