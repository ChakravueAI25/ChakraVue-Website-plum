import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, CustomEase, MotionPathPlugin, useGSAP);

// One easing family for the whole site so every move feels like the same hand.
// "cv.out" is a long, soft expo-style settle; "cv.inOut" is for things that
// travel (iris, clip reveals).
CustomEase.create("cv.out", "0.16, 1, 0.3, 1");
CustomEase.create("cv.inOut", "0.76, 0, 0.24, 1");

gsap.defaults({ ease: "cv.out", duration: 1 });
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger, SplitText, useGSAP };
