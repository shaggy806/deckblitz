import { defineCard } from "../define.js";

// EDHREC rank 6339.
//
// Rulings:
//   [2020-04-17] Use the exiled creature’s toughness as it last existed on the battlefield to
//     determine how much life you lose.
//   [2020-04-17] Whether you control a Human is checked only after exiling the target creature.

export default defineCard({
  name: "Dire Tactics",
  manaCost: "{W}{B}",
  colors: ["W", "B"],
  types: ["instant"],
  text: "Exile target creature. If you don't control a Human, you lose life equal to that creature's toughness.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "not", of: { kind: "controls", filter: { subtype: "Human" }, atLeast: 1 } },
        // The exiled creature's toughness as it last existed on the battlefield.
        then: { kind: "lose-life", amount: { toughnessOf: 0 } },
      },
    ],
  },
});
