import React from 'react';
import { staticFile } from 'remotion';
import FacelessAutomation, {
  defaultProps as facelessDefaults,
  FacelessAutomationProps,
} from './FacelessAutomation';

export const minute07Defaults: FacelessAutomationProps = {
  ...facelessDefaults,
  audioUrl: staticFile('audio/wealth-minute-07.mp3'),
  captionsUrl: staticFile('captions/wealth-minute-07.srt'),
  script:
    "Most people confuse motion with progress. They work harder, stress harder, and still stay in the same place financially. Wealthy people do not just work harder. They design systems that keep producing value after the initial effort is done.",
};

const WealthMinute07: React.FC<Partial<FacelessAutomationProps>> = (props) => {
  return <FacelessAutomation {...minute07Defaults} {...props} />;
};

export default WealthMinute07;
