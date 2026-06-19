import React from 'react';
import { staticFile } from 'remotion';
import FacelessAutomation, {
  defaultProps as facelessDefaults,
  FacelessAutomationProps,
} from './FacelessAutomation';

export const minute09Defaults: FacelessAutomationProps = {
  ...facelessDefaults,
  audioUrl: staticFile('audio/wealth-minute-09.mp3'),
  captionsUrl: staticFile('captions/wealth-minute-09.srt'),
  script:
    "Another big difference is risk management. Most people avoid all risk and end up trapped by inflation. Wealthy people avoid dumb risk, but they actively take calculated risk with asymmetric upside.",
};

const WealthMinute09: React.FC<Partial<FacelessAutomationProps>> = (props) => {
  return <FacelessAutomation {...minute09Defaults} {...props} />;
};

export default WealthMinute09;
