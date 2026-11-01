import { defineCard } from "../define.js";

// EDHREC rank 31167.
//
// Rulings:
//   [2004-10-04] If a creature leaves the battlefield before the end of combat, then the Lowland
//     Basilisk effect on it will end.
//   [2004-10-04] If it damages a creature outside of combat, its effect will destroy the creature
//     at the end of the next combat.

export default defineCard({
  name: "Lowland Basilisk",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Basilisk"],
  power: 1,
  toughness: 3,
  text: "Whenever this creature deals damage to a creature, destroy that creature at end of combat.",
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "creature" },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: "end-of-combat",
        effect: { kind: "destroy", target: "trigger-recipient" },
        text: "Destroy that creature.",
      },
      resolve: null,
      text: "Whenever this creature deals damage to a creature, destroy that creature at end of combat.",
    },
  ],
});
