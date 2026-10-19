import { defineCard } from "../define.js";

// EDHREC rank 15107.
// "A commander" is anyone's commander you control, not only your own.

const PUMP_TEXT = "This creature gets +2/+0 as long as you control a commander that's a creature or planeswalker.";

export default defineCard({
  name: "Gray Harbor Merfolk",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Rogue"],
  power: 0,
  toughness: 3,
  text: `This creature can't be blocked.\n${PUMP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantKeywords: ["unblockable"],
      text: "This creature can't be blocked.",
    },
    {
      affects: { scope: "self" },
      condition: {
        kind: "controls",
        filter: { isCommander: true, typesAnyOf: ["creature", "planeswalker"] },
        atLeast: 1,
      },
      grantPt: [2, 0],
      text: PUMP_TEXT,
    },
  ],
});
