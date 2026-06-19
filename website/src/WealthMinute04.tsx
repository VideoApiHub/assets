import React from 'react';
import { staticFile } from 'remotion';
import FacelessAutomation, {
  defaultProps as facelessDefaults,
  FacelessAutomationProps,
} from './FacelessAutomation';

export const minute04Defaults: FacelessAutomationProps = {
  ...facelessDefaults,
  audioUrl: staticFile('audio/wealth-minute-04.mp3'),
  captionsUrl: staticFile('captions/wealth-minute-04.srt'),
  script:
    "Until you change those thought patterns your bank account will stay exactly where it is. The first major shift that separates wealthy thinking from poor thinking is understanding the difference between assets and liabilities. Most people think they know what an asset is, so they point to a car, an expensive watch, or a degree. But an asset puts money in your pocket and a liability takes money out of your pocket. That car you are proud of may be costing you every month in payments, insurance, gas, and maintenance. The wealthy understand this and ask one simple question before they buy anything.",
};

const WealthMinute04: React.FC<Partial<FacelessAutomationProps>> = (props) => {
  return <FacelessAutomation {...minute04Defaults} {...props} />;
};

export default WealthMinute04;
