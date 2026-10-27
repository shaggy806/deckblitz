import { defineCard } from "../define.js";

// EDHREC rank 23954. Harsh Sustenance's shape, counting every Cleric on the
// battlefield. No state-based action runs mid-resolution, so a Cleric the
// damage destroys still counts for the life gain.

const CLERICS = { countOf: { subtype: "Cleric" } } as const;

export default defineCard({
  name: "Profane Prayers",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Profane Prayers deals X damage to any target and you gain X life, where X is the number of Clerics on the battlefield.",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: CLERICS, target: 0 },
      { kind: "gain-life", amount: CLERICS },
    ],
  },
});
