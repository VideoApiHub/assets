import React from 'react';
import { staticFile } from 'remotion';
import FacelessAutomation, {
  defaultProps as facelessDefaults,
  FacelessAutomationProps,
} from './FacelessAutomation';

export const minute06Defaults: FacelessAutomationProps = {
  ...facelessDefaults,
  audioUrl: staticFile('audio/wealth-minute-06.mp3'),
  captionsUrl: staticFile('captions/wealth-minute-06.srt'),
  script:
    "Instead of asking whether they can afford something right now, they ask whether this purchase or investment will help build the life they want in the future. Instead of celebrating a tax refund as free money, they see it as proof they gave the government an interest free loan and adjust accordingly. Here is where this gets really interesting. The wealthy do not just think long term about investments. They think long term about education and skills. If you apply these shifts consistently, you move from financial defense into strategic offense and you start building real leverage over time. That is the mindset difference that compounds into serious wealth.",
};

const WealthMinute06: React.FC<Partial<FacelessAutomationProps>> = (props) => {
  return <FacelessAutomation {...minute06Defaults} {...props} />;
};

export default WealthMinute06;