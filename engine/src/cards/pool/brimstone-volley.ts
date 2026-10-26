import { defineCard } from "../define.js";

// EDHREC rank 19914. Morbid read as the spell resolves.

export default defineCard({
  name: "Brimstone Volley",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Brimstone Volley deals 3 damage to any target.\nMorbid — Brimstone Volley deals 5 damage instead if a creature died this turn.",
  targets: ["any-target"],
  effect: {
    kind: "damage",
    amount: { ifCondition: { kind: "creature-died-this-turn" }, then: 5, else: 3 },
    target: 0,
  },
});
