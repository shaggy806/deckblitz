import { defineCard } from "../define.js";

// Alliances. EDHREC rank 30097.
//
// Reaches the nonartifact creatures there as it resolves (rule 611.2c).

export default defineCard({
  name: "Stench of Decay",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Nonartifact creatures get -1/-1 until end of turn.",
  targets: [],
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", notTypes: ["artifact"] },
    power: -1,
    toughness: -1,
    duration: "end-of-turn",
  },
});
