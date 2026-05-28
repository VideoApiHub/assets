import { Composition } from "remotion";
import VerticalPhoneComparison, { getTotalDuration } from "../phone-comparision";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PhoneComparison"
        component={VerticalPhoneComparison}
        durationInFrames={getTotalDuration()}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
