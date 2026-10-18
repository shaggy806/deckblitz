import { defineCard } from "../define.js";

// EDHREC rank 18120.
//
// Izzet Charm's modal shape: Misleading Motes's owner's choice of top or
// bottom over a nonland permanent, or Negate.
const LIBRARY_TEXT =
  "The owner of target nonland permanent puts it on their choice of the top or bottom of their library.";
const COUNTER_TEXT = "Counter target noncreature spell.";

export default defineCard({
  name: "Riverwalk Technique",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: `Choose one —\n• ${LIBRARY_TEXT}\n• ${COUNTER_TEXT}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: LIBRARY_TEXT,
        targets: ["nonland-permanent"],
        effect: { kind: "put-on-library", target: 0, position: { ownerChooses: ["top", "bottom"] } },
      },
      {
        text: COUNTER_TEXT,
        targets: ["noncreature-spell"],
        effect: { kind: "counter", target: 0 },
      },
    ],
  },
});
