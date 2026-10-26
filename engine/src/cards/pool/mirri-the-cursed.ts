import { defineCard } from "../define.js";

// Planar Chaos (PLC). EDHREC rank 9944.
//
// Rulings:
//   [2021-03-19] If Mirri the Cursed is blocking or blocked by a creature that doesn't have first
//     strike or double strike, Mirri will deal combat damage to that creature, then get a +1/+1
//     counter, then (if the other creature survived) Mirri will be dealt combat damage.

const TRIGGER_TEXT = "Whenever Mirri deals combat damage to a creature, put a +1/+1 counter on Mirri.";

export default defineCard({
  name: "Mirri the Cursed",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire", "Cat"],
  power: 3,
  toughness: 2,
  keywords: ["flying", "first-strike", "haste"],
  text: `Flying, first strike, haste\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "creature", combat: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
