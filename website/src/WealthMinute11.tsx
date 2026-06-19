import React from 'react';
import { staticFile } from 'remotion';
import FacelessAutomation, {
  defaultProps as facelessDefaults,
  FacelessAutomationProps,
} from './FacelessAutomation';

export const minute11Defaults: FacelessAutomationProps = {
  ...facelessDefaults,
  audioUrl: staticFile('audio/wealth-minute-11.mp3'),
  captionsUrl: staticFile('captions/wealth-minute-11.srt'),
  script:
    "If your income stops when you stop working, you are carrying concentration risk. Wealthy thinkers diversify effort into assets, skills, and distribution channels so one disruption does not collapse everything.",
};

const WealthMinute11: React.FC<Partial<FacelessAutomationProps>> = (props) => {
  return <FacelessAutomation {...minute11Defaults} {...props} />;
};

export default WealthMinute11;
