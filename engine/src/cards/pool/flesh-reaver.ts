import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 10631.
//
// Any damage, not only combat damage (the ruling). "A creature or opponent"
// is two trigger events of one ability (`sameAbilityAs`); each deals the
// damage that event dealt back to its controller, from Flesh Reaver.

const TEXT =
  "Whenever this creature deals damage to a creature or opponent, this creature deals that much damage to you.";
const BACKLASH = { kind: "damage", amount: { triggerValue: true }, who: "you" } as const;

export default defineCard({
  name: "Flesh Reaver",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Horror"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "creature" },
      sameAbilityAs: 1,
      targets: [],
      effect: BACKLASH,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "deals-damage", who: "self", to: "opponent" },
      sameAbilityAs: 0,
      targets: [],
      effect: BACKLASH,
      resolve: null,
      text: TEXT,
    },
  ],
});
