import React from 'react';
import { staticFile } from 'remotion';
import FacelessAutomation, {
  defaultProps as facelessDefaults,
  FacelessAutomationProps,
} from './FacelessAutomation';

export const minute05Defaults: FacelessAutomationProps = {
  ...facelessDefaults,
  audioUrl: staticFile('audio/wealth-minute-05.mp3'),
  captionsUrl: staticFile('captions/wealth-minute-05.srt'),
  script:
    "Will this make me money or cost me money? If it makes money they buy it. If it costs money they either avoid it or use income from real assets to pay for it. This is why you will often see millionaires driving older cars while people making fifty thousand a year finance new trucks they cannot afford. The second shift is about time horizon. Poor people think about money in days, weeks, and months. Wealthy people think in decades. They make decisions based on where they want to be in ten, twenty, or thirty years. That long term thinking changes everything about how they approach money.",
};

const WealthMinute05: React.FC<Partial<FacelessAutomationProps>> = (props) => {
  return <FacelessAutomation {...minute05Defaults} {...props} />;
};

export default WealthMinute05;
