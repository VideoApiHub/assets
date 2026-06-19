import React from 'react';
import { staticFile } from 'remotion';
import FacelessAutomation, {
  defaultProps as facelessDefaults,
  FacelessAutomationProps,
} from './FacelessAutomation';

export const minute08Defaults: FacelessAutomationProps = {
  ...facelessDefaults,
  audioUrl: staticFile('audio/wealth-minute-08.mp3'),
  captionsUrl: staticFile('captions/wealth-minute-08.srt'),
  script:
    "Think about how you spend your attention. Poor financial habits often start with emotional decisions and short term dopamine. Wealth builders protect attention like capital, then allocate both with intention.",
};

const WealthMinute08: React.FC<Partial<FacelessAutomationProps>> = (props) => {
  return <FacelessAutomation {...minute08Defaults} {...props} />;
};

export default WealthMinute08;
