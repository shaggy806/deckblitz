import { defineCard } from "../define.js";

// "Crews a Vehicle" (rule 702.122b): tapped to pay its crew cost, as the cost
// is paid — so this resolves before the crew ability does.
const CREWS_TEXT = "Whenever this creature crews a Vehicle, that Vehicle gains haste until end of turn.";

export default defineCard({
  name: "Speedway Fanatic",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Pilot"],
  power: 2,
  toughness: 1,
  keywords: ["haste"],
  text: `Haste\n${CREWS_TEXT}`,
  triggered: [
    {
      trigger: { on: "crews-or-saddles", who: "self", as: ["crew"] },
      targets: [],
      effect: { kind: "grant-keyword", target: "trigger-object", keyword: "haste", duration: "end-of-turn" },
      resolve: null,
      text: CREWS_TEXT,
    },
  ],
});
