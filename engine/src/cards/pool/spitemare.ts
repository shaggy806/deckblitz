import { defineCard } from "../define.js";

// Eventide (EVE). EDHREC rank 12340.
//
// Rulings:
//   [2008-08-01] Even if the amount of damage dealt to Spitemare is enough to destroy it,
//     Spitemare's ability will trigger and it will deal the full amount of damage to the target.
//
// Boros Reckoner's shape: the trigger value is the damage dealt.

export default defineCard({
  name: "Spitemare",
  manaCost: "{2}{R/W}{R/W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 3,
  text: "Whenever this creature is dealt damage, it deals that much damage to any target.",
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: { triggerValue: true }, target: 0 },
      resolve: null,
      text: "Whenever this creature is dealt damage, it deals that much damage to any target.",
    },
  ],
});
