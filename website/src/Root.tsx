import { Composition } from "remotion";
import VerticalPhoneComparison, { getTotalDuration } from "./LaunchTrailer";
import CompanyNumbers, {
  defaultProps as companyNumbersDefaults,
  getTotalDuration as getCompanyNumbersDuration,
} from "./CompanyNumbers";
import FacelessAutomation, {
  defaultProps as facelessAutomationDefaults,
  getDurationFromAudio,
} from "./FacelessAutomation";
import WealthMinute01, { minute01Defaults } from './WealthMinute01';
import WealthMinute01ThreeD, { minute01ThreeDDefaults } from './WealthMinute01ThreeD';
import WealthMinute02, { minute02Defaults } from './WealthMinute02';
import WealthMinute03, { minute03Defaults } from './WealthMinute03';
import WealthMinute04, { minute04Defaults } from './WealthMinute04';
import WealthMinute05, { minute05Defaults } from './WealthMinute05';
import WealthMinute06, { minute06Defaults } from './WealthMinute06';
import WealthMinute07, { minute07Defaults } from './WealthMinute07';
import WealthMinute08, { minute08Defaults } from './WealthMinute08';
import WealthMinute09, { minute09Defaults } from './WealthMinute09';
import WealthMinute10, { minute10Defaults } from './WealthMinute10';
import WealthMinute11, { minute11Defaults } from './WealthMinute11';
import WealthMinute12, { minute12Defaults } from './WealthMinute12';
import SaasDemo, { pillarDemoDefaults, getSaasDemoDuration } from './SaasDemo';
import { guardianGazeDemo } from './saas-demo-props/guardian-gaze';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="LaunchTrailer"
        component={VerticalPhoneComparison}
        durationInFrames={getTotalDuration()}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="CompanyNumbers"
        component={CompanyNumbers}
        durationInFrames={getCompanyNumbersDuration()}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={companyNumbersDefaults}
      />
      <Composition
        id="FacelessAutomation"
        component={FacelessAutomation}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={facelessAutomationDefaults}
        calculateMetadata={async ({ props }) => {
          const p = props as typeof facelessAutomationDefaults;
          const durationInFrames = await getDurationFromAudio(p.audioUrl, 30);
          return {durationInFrames};
        }}
      />
      <Composition
        id="WealthMinute01"
        component={WealthMinute01}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={minute01Defaults}
        calculateMetadata={async ({ props }) => {
          const p = props as typeof minute01Defaults;
          const durationInFrames = await getDurationFromAudio(p.audioUrl, 30);
          return {durationInFrames};
        }}
      />
      <Composition
        id="WealthMinute01ThreeD"
        component={WealthMinute01ThreeD}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={minute01ThreeDDefaults}
        calculateMetadata={async ({ props }) => {
          const p = props as typeof minute01ThreeDDefaults;
          const durationInFrames = await getDurationFromAudio(p.audioUrl, 30);
          return {durationInFrames};
        }}
      />
      <Composition
        id="WealthMinute02"
        component={WealthMinute02}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={minute02Defaults}
        calculateMetadata={async ({ props }) => {
          const p = props as typeof minute02Defaults;
          const durationInFrames = await getDurationFromAudio(p.audioUrl, 30);
          return {durationInFrames};
        }}
      />
      <Composition
        id="WealthMinute03"
        component={WealthMinute03}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={minute03Defaults}
        calculateMetadata={async ({ props }) => {
          const p = props as typeof minute03Defaults;
          const durationInFrames = await getDurationFromAudio(p.audioUrl, 30);
          return {durationInFrames};
        }}
      />
      <Composition
        id="WealthMinute04"
        component={WealthMinute04}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={minute04Defaults}
        calculateMetadata={async ({ props }) => {
          const p = props as typeof minute04Defaults;
          const durationInFrames = await getDurationFromAudio(p.audioUrl, 30);
          return {durationInFrames};
        }}
      />
      <Composition
        id="WealthMinute05"
        component={WealthMinute05}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={minute05Defaults}
        calculateMetadata={async ({ props }) => {
          const p = props as typeof minute05Defaults;
          const durationInFrames = await getDurationFromAudio(p.audioUrl, 30);
          return {durationInFrames};
        }}
      />
      <Composition
        id="WealthMinute06"
        component={WealthMinute06}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={minute06Defaults}
        calculateMetadata={async ({ props }) => {
          const p = props as typeof minute06Defaults;
          const durationInFrames = await getDurationFromAudio(p.audioUrl, 30);
          return {durationInFrames};
        }}
      />
      <Composition
        id="WealthMinute07"
        component={WealthMinute07}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={minute07Defaults}
        calculateMetadata={async ({ props }) => {
          const p = props as typeof minute07Defaults;
          const durationInFrames = await getDurationFromAudio(p.audioUrl, 30);
          return {durationInFrames};
        }}
      />
      <Composition
        id="WealthMinute08"
        component={WealthMinute08}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={minute08Defaults}
        calculateMetadata={async ({ props }) => {
          const p = props as typeof minute08Defaults;
          const durationInFrames = await getDurationFromAudio(p.audioUrl, 30);
          return {durationInFrames};
        }}
      />
      <Composition
        id="WealthMinute09"
        component={WealthMinute09}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={minute09Defaults}
        calculateMetadata={async ({ props }) => {
          const p = props as typeof minute09Defaults;
          const durationInFrames = await getDurationFromAudio(p.audioUrl, 30);
          return {durationInFrames};
        }}
      />
      <Composition
        id="WealthMinute10"
        component={WealthMinute10}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={minute10Defaults}
        calculateMetadata={async ({ props }) => {
          const p = props as typeof minute10Defaults;
          const durationInFrames = await getDurationFromAudio(p.audioUrl, 30);
          return {durationInFrames};
        }}
      />
      <Composition
        id="WealthMinute11"
        component={WealthMinute11}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={minute11Defaults}
        calculateMetadata={async ({ props }) => {
          const p = props as typeof minute11Defaults;
          const durationInFrames = await getDurationFromAudio(p.audioUrl, 30);
          return {durationInFrames};
        }}
      />
      <Composition
        id="WealthMinute12"
        component={WealthMinute12}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={minute12Defaults}
        calculateMetadata={async ({ props }) => {
          const p = props as typeof minute12Defaults;
          const durationInFrames = await getDurationFromAudio(p.audioUrl, 30);
          return {durationInFrames};
        }}
      />
      <Composition
        id="SaasDemoPillar"
        component={SaasDemo}
        durationInFrames={getSaasDemoDuration(pillarDemoDefaults)}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={pillarDemoDefaults}
        calculateMetadata={({ props }) => ({
          durationInFrames: getSaasDemoDuration(props as typeof pillarDemoDefaults),
        })}
      />
      <Composition
        id="SaasDemoGuardianGaze"
        component={SaasDemo}
        durationInFrames={getSaasDemoDuration(guardianGazeDemo)}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={guardianGazeDemo}
        calculateMetadata={({ props }) => ({
          durationInFrames: getSaasDemoDuration(props as typeof guardianGazeDemo),
        })}
      />
    </>
  );
};
