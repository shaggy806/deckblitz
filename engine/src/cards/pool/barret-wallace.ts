import { defineCard } from "../define.js";

// EDHREC rank 10137.
//
// Rulings:
//   [2025-06-06] Use the number of equipped creatures you control at the time Barret Wallace's
//     last ability resolves to determine how much damage to deal.
//
// "Defending player" is the player the attack trigger names (`trigger-player`).
const TEXT =
  "Whenever Barret Wallace attacks, it deals damage equal to the number of equipped creatures you control to defending player.";

export default defineCard({
  name: "Barret Wallace",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rebel"],
  power: 4,
  toughness: 4,
  keywords: ["reach"],
  text: `Reach\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "damage",
        who: "trigger-player",
        amount: { countOf: { type: "creature", controlledBy: "you", equipped: true } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
