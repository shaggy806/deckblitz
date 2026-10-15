import { defineCard } from "../define.js";

// EDHREC rank 14972.
//
// X is counted once, as it resolves, and a Spacecraft that's a creature
// counts once (the rulings): one count over permanents that are either.

export default defineCard({
  name: "Focus Fire",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Focus Fire deals X damage to target attacking or blocking creature, where X is 2 plus the number of creatures and/or Spacecraft you control.",
  targets: ["attacking-or-blocking-creature"],
  effect: {
    kind: "damage",
    amount: {
      sum: [2, { countOf: { anyOf: [{ type: "creature" }, { subtype: "Spacecraft" }], controlledBy: "you" } }],
    },
    target: 0,
  },
});
