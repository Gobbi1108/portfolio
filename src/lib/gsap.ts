// Central GSAP entrypoint.
//
// Registers ScrollTrigger exactly once and re-exports both for any caller.
// Components and islands MUST import gsap/ScrollTrigger from here rather than
// from "gsap"/"gsap/ScrollTrigger" directly, so the plugin registration stays
// in a single place (see .gemini/styleguide.md §8).

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };
