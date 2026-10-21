import { defineCard } from "../define.js";

// EDHREC rank 14072.
//
// Rulings:
//   [2020-06-23] As Goremand's triggered ability resolves, first the next opponent in turn order
//     chooses a creature they control, then each other opponent in turn order does the same
//     knowing the choices made before them. Then all the chosen creatures are sacrificed at the
//     same time.

export default defineCard({
  name: "Goremand",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 5,
  toughness: 5,
  keywords: ["flying", "trample"],
  text: "As an additional cost to cast this spell, sacrifice a creature.\nFlying\nTrample (This creature can deal excess combat damage to the player or planeswalker it's attacking.)\nWhen this creature enters, each opponent sacrifices a creature.",
  additionalCost: { sacrifice: { type: "creature" } },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "sacrifice", who: "each-opponent", filter: { type: "creature" }, count: 1 },
      resolve: null,
      text: "When this creature enters, each opponent sacrifices a creature.",
    },
  ],
});
