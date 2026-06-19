import React from 'react';
import { staticFile } from 'remotion';
import FacelessAutomation, {
  defaultProps as facelessDefaults,
  FacelessAutomationProps,
} from './FacelessAutomation';

export const minute12Defaults: FacelessAutomationProps = {
  ...facelessDefaults,
  audioUrl: staticFile('audio/wealth-minute-12.mp3'),
  captionsUrl: staticFile('captions/wealth-minute-12.srt'),
  script:
    "The final shift is identity. Stop seeing money as survival and start treating it as a system to design. When your behavior aligns with long term ownership, compounding does the heavy lifting for you.",
};

const WealthMinute12: React.FC<Partial<FacelessAutomationProps>> = (props) => {
  return <FacelessAutomation {...minute12Defaults} {...props} />;
};

export default WealthMinute12;