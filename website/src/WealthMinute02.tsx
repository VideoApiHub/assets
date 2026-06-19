import React from 'react';
import { staticFile } from 'remotion';
import FacelessAutomation, {
  defaultProps as facelessDefaults,
  FacelessAutomationProps,
} from './FacelessAutomation';

export const minute02Defaults: FacelessAutomationProps = {
  ...facelessDefaults,
  audioUrl: staticFile('audio/wealth-minute-02.mp3'),
  captionsUrl: staticFile('captions/wealth-minute-02.srt'),
  script:
    "While most people are stuck playing financial defense constantly worried about bills and expenses, the wealthy are playing offense by strategically building systems that work for them even when they are sleeping. My name is Nick and I spend way too much time studying the habits and mindsets of people who have cracked the code on building serious wealth. If you are tired of thinking like everyone else and getting the same mediocre results everyone else gets, this perspective can change everything. The truth is most of us were programmed from childhood to think about money in ways that virtually guarantee we will stay middle class forever.",
};

const WealthMinute02: React.FC<Partial<FacelessAutomationProps>> = (props) => {
  return <FacelessAutomation {...minute02Defaults} {...props} />;
};

export default WealthMinute02;
