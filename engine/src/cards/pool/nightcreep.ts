import { defineCard } from "../define.js";

export default defineCard({
  name: "Nightcreep",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Until end of turn, all creatures become black and all lands become Swamps.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "for-each-permanent",
        filter: { type: "creature" },
        simultaneous: true,
        effect: { kind: "become-color", target: 0, colors: ["B"], duration: "end-of-turn" },
      },
      {
        kind: "for-each-permanent",
        filter: { type: "land" },
        simultaneous: true,
        effect: { kind: "add-types", target: 0, setSubtypes: ["Swamp"], duration: "end-of-turn" },
      },
    ],
  },
});
