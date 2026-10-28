import { defineCard } from "../define.js";

// EDHREC rank 17595.
//
// One choice of colour, then the target and every other creature sharing a
// colour with it as it resolves gain protection from it, all with one
// timestamp.
export default defineCard({
  name: "Bathe in Light",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Radiance — Choose a color. Target creature and each other creature that shares a color with it gain protection from the chosen color until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "grant-protection",
    target: 0,
    filter: { type: "creature", sharesColorWithTarget: 0 },
    from: { choose: "color" },
    duration: "end-of-turn",
  },
});
