import React from 'react';
import { staticFile } from 'remotion';
import FacelessAutomation, {
  defaultProps as facelessDefaults,
  FacelessAutomationProps,
} from './FacelessAutomation';

export const minute10Defaults: FacelessAutomationProps = {
  ...facelessDefaults,
  audioUrl: staticFile('audio/wealth-minute-10.mp3'),
  captionsUrl: staticFile('captions/wealth-minute-10.srt'),
  script:
    "Cash flow comes before flexing. The wealthy prioritize predictable inflows first, then lifestyle upgrades second. This simple order protects momentum and prevents expensive financial backtracking.",
};

const WealthMinute10: React.FC<Partial<FacelessAutomationProps>> = (props) => {
  return <FacelessAutomation {...minute10Defaults} {...props} />;
};

export default WealthMinute10;
