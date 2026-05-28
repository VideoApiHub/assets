import { Composition } from "remotion";
import VerticalPhoneComparison from "../phone-comparision";
import comparisonData from "../phone-comparision-data.json";

export const RemotionRoot: React.FC = () => {
  const introDuration = 90;
  const totalFrames =
    introDuration +
    comparisonData.sections.length * comparisonData.framesPerSection +
    comparisonData.finalSlideDuration;

  return (
    <>
      <Composition
        id="PhoneComparison"
        component={VerticalPhoneComparison}
        durationInFrames={totalFrames}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
