import { defineCard } from "../define.js";

// EDHREC rank 23362.
const SMALL = "Target creature has base power and toughness 1/1 until end of turn.";
const BIG = "Target creature has base power and toughness 4/5 until end of turn.";

export default defineCard({
  name: "Perfected Theory",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: `Choose one —\n• ${SMALL}\n• ${BIG}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: SMALL,
        targets: ["creature"],
        effect: {
          kind: "animate",
          target: 0,
          power: 1,
          toughness: 1,
          addTypes: [],
          addSubtypes: [],
          duration: "end-of-turn",
        },
      },
      {
        text: BIG,
        targets: ["creature"],
        effect: {
          kind: "animate",
          target: 0,
          power: 4,
          toughness: 5,
          addTypes: [],
          addSubtypes: [],
          duration: "end-of-turn",
        },
      },
    ],
  },
});
