import { defineCard } from "../define.js";

// `nthEachTurn` counts every spell you cast this turn, before Ripley was on
// the battlefield too, and countered ones (the rulings); a copy isn't cast.
export default defineCard({
  name: "Captain Ripley Vance",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 3,
  toughness: 2,
  text: "Whenever you cast your third spell each turn, put a +1/+1 counter on Captain Ripley Vance, then it deals damage equal to its power to any target.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", nthEachTurn: 3 },
      targets: ["any-target"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "damage", amount: { powerOf: "source" }, target: 0 },
        ],
      },
      resolve: null,
      text: "Whenever you cast your third spell each turn, put a +1/+1 counter on Captain Ripley Vance, then it deals damage equal to its power to any target.",
    },
  ],
});
