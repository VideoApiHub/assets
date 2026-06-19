import React from 'react';
import { staticFile } from 'remotion';
import FacelessAutomation, {
  defaultProps as facelessDefaults,
  FacelessAutomationProps,
} from './FacelessAutomation';

export const minute01ThreeDDefaults: FacelessAutomationProps = {
  ...facelessDefaults,
  audioUrl: staticFile('audio/wealth-minute-01.mp3'),
  captionsUrl: staticFile('captions/wealth-minute-01.srt'),
  subtitleFadeOutFrames: 2,
  imageSceneCount: 4,
  enable3DLayer: true,
  threeDOnlyMode: true,
  images: [],
  sceneModelUrl: staticFile('models/LittlestTokyo.glb'),
  primaryCharacterModelUrl: staticFile('models/CesiumMan.glb'),
  secondaryCharacterModelUrl: staticFile('models/Astronaut.glb'),
  script:
    "Have you ever noticed how some people seem to effortlessly glide through life while the rest of us are grinding away just to keep our heads above water? They are not necessarily smarter than you. They did not inherit secret family fortunes and they are definitely not using some mystical money manifestation technique they learned from a guru on Instagram. Yet somehow they are building wealth while you are wondering where your paycheck disappeared to again. Here is what is really happening. The top one percent do not just have more money than everyone else. They think about money in a completely different way.",
};

const WealthMinute01ThreeD: React.FC<Partial<FacelessAutomationProps>> = (props) => {
  return <FacelessAutomation {...minute01ThreeDDefaults} {...props} />;
};

export default WealthMinute01ThreeD;
