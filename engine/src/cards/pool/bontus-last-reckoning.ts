import { defineCard } from "../define.js";

// EDHREC rank 12767. Hour of Devastation. No land you control untaps during
// your next untap step, those that arrive later included (the rulings).
export default defineCard({
  name: "Bontu's Last Reckoning",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy all creatures. Lands you control don't untap during your next untap step.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy-all", filter: { type: "creature" } },
      { kind: "skip-next-untap", filter: { type: "land" } },
    ],
  },
});
