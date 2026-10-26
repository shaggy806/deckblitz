import { defineCard } from "../define.js";

// EDHREC rank 26001. Shards of Alara.
// Makes Zombie → "Zombie Token".
//
// Rulings:
//   [2008-10-01] If you somehow control no non-Zombie creatures when the triggered ability
//     resolves, you won't have to sacrifice anything. You'll still get a Zombie token.
//   [2008-10-01] If Archdemon of Unx is the only non-Zombie creature you control when the
//     triggered ability resolves, you'll have to sacrifice it. You'll still get a Zombie token.

const UPKEEP_TEXT =
  "At the beginning of your upkeep, sacrifice a non-Zombie creature, then create a 2/2 black Zombie creature token.";

export default defineCard({
  name: "Archdemon of Unx",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 6,
  toughness: 6,
  keywords: ["flying", "trample"],
  text: `Flying, trample\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice", who: "you", filter: { type: "creature", notSubtypes: ["Zombie"] }, count: 1 },
          { kind: "create-token", token: "Zombie Token", count: 1 },
        ],
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
