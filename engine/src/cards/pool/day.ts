import { defineCard } from "../define.js";

const FACES = ["Night // Day", "Night", "Day"];

// The right half of Night // Day (see night-day.ts). Arms of Hadar's shape.
export default defineCard({
  name: "Day",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Creatures target player controls get +1/+1 until end of turn.",
  targets: ["player"],
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", controlledBy: "you" },
    controlledByTarget: 0,
    power: 1,
    toughness: 1,
    duration: "end-of-turn",
  },
  faces: FACES,
  split: true,
});
