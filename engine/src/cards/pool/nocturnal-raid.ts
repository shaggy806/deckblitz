import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 30952.
//
// The black creatures on the battlefield as it resolves (the ruling).

export default defineCard({
  name: "Nocturnal Raid",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Black creatures get +2/+0 until end of turn.",
  targets: [],
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", colors: ["B"] },
    power: 2,
    toughness: 0,
    duration: "end-of-turn",
  },
});
