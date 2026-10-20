import { defineCard } from "../define.js";

// EDHREC rank 20350. Modern Horizons 2.
//
// "If the sacrificed permanent was an artifact" reads it as it last existed
// on the battlefield (the `sacrificed` condition).
export default defineCard({
  name: "Foundry Helix",
  manaCost: "{1}{R}{W}",
  colors: ["W", "R"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, sacrifice a permanent.\nFoundry Helix deals 4 damage to any target. If the sacrificed permanent was an artifact, you gain 4 life.",
  targets: ["any-target"],
  additionalCost: { sacrifice: { controlledBy: "you" } },
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 4, target: 0 },
      {
        kind: "conditional",
        condition: { kind: "sacrificed", filter: { type: "artifact" } },
        then: { kind: "gain-life", amount: 4 },
      },
    ],
  },
});
