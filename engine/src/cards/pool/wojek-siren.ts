import { defineCard } from "../define.js";

// EDHREC rank 28685.

export default defineCard({
  name: "Wojek Siren",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Radiance — Target creature and each other creature that shares a color with it get +1/+1 until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", sharesColorWithTarget: 0 },
    power: 1,
    toughness: 1,
    duration: "end-of-turn",
  },
});
