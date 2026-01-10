import { DiagonalCrossGridTop } from "@/components/landing/grids";
import { PurpleTopShade } from "@/components/landing/perpleTopShade";

export function LandingBackground() {
  return (
    <>
      <DiagonalCrossGridTop
        mask={false}
        className="pointer-events-none fixed inset-0 -z-20"
      />
      <PurpleTopShade
        fixed
        base="transparent"
        glowOpacity={0.22}
        className="pointer-events-none fixed inset-0 -z-10"
      />
    </>
  );
}
