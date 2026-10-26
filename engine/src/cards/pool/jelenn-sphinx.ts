import { defineCard } from "../define.js";

// EDHREC rank 22674.

const TEXT = "Whenever this creature attacks, other attacking creatures get +1/+1 until end of turn.";

export default defineCard({
  name: "Jelenn Sphinx",
  manaCost: "{3}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Sphinx"],
  power: 1,
  toughness: 5,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", attacking: true },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
        exceptSource: true,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
