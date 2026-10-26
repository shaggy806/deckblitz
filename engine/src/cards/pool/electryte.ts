import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 31456.
//
// "Each blocking creature" is every creature blocking as it resolves, not
// only those blocking this one; "its power" is read then too (as it last
// existed, if it has left).

const TEXT =
  "Whenever this creature deals combat damage to defending player, it deals damage equal to its power to each blocking creature.";

export default defineCard({
  name: "Electryte",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Trilobite", "Beast"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "damage-all",
        filter: { type: "creature", blocking: true },
        amount: { powerOf: "source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
