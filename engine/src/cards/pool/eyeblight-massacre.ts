import { defineCard } from "../define.js";

// EDHREC rank 12276.

export default defineCard({
  name: "Eyeblight Massacre",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Non-Elf creatures get -2/-2 until end of turn.",
  targets: [],
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", notSubtypes: ["Elf"] },
    power: -2,
    toughness: -2,
    duration: "end-of-turn",
  },
});
