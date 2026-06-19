import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Composition } from "remotion";
import VerticalPhoneComparison, { getTotalDuration } from "./LaunchTrailer";
import CompanyNumbers, { defaultProps as companyNumbersDefaults, getTotalDuration as getCompanyNumbersDuration, } from "./CompanyNumbers";
import FacelessAutomation, { defaultProps as facelessAutomationDefaults, getDurationFromAudio, } from "./FacelessAutomation";
export const RemotionRoot = () => {
    return (_jsxs(_Fragment, { children: [_jsx(Composition, { id: "LaunchTrailer", component: VerticalPhoneComparison, durationInFrames: getTotalDuration(), fps: 30, width: 1920, height: 1080 }), _jsx(Composition, { id: "CompanyNumbers", component: CompanyNumbers, durationInFrames: getCompanyNumbersDuration(), fps: 30, width: 1920, height: 1080, defaultProps: companyNumbersDefaults }), _jsx(Composition, { id: "FacelessAutomation", component: FacelessAutomation, durationInFrames: 1800, fps: 30, width: 1920, height: 1080, defaultProps: facelessAutomationDefaults, calculateMetadata: async ({ props }) => {
                    const p = props;
                    const durationInFrames = await getDurationFromAudio(p.audioUrl, 30);
                    return { durationInFrames };
                } })] }));
};
