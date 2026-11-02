import { defineCard } from "../define.js";

// Rulings:
//   You decide which creature to spare as Duneblast resolves. This choice doesn't target the
//   creature. If you don't choose a creature, then all creatures will be destroyed.

export default defineCard({
  name: "Duneblast",
  manaCost: "{4}{W}{B}{G}",
  colors: ["W", "B", "G"],
  types: ["sorcery"],
  text: "Choose up to one creature. Destroy the rest.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "vote", choose: true, who: "you", for: { permanent: { type: "creature" }, upTo: 1, keep: true } },
      { kind: "destroy-all", filter: { type: "creature", notThisWay: "chosen" } },
    ],
  },
});
