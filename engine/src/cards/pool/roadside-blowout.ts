import { defineCard } from "../define.js";

// EDHREC rank 23394.
//
// Rulings:
//   [2025-02-07] If there's an {X} in a permanent's mana cost, X is 0 when determining its mana
//     value.
//
// Ajani's Response's cost reduction, read off the one target.

export default defineCard({
  name: "Roadside Blowout",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "This spell costs {2} less to cast if it targets a permanent with mana value 1.\nReturn target creature or Vehicle an opponent controls to its owner's hand.\nDraw a card.",
  targets: [{ kind: "permanent", whose: "opponent", filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] } }],
  targetCostReduction: { filter: { manaValue: { op: "eq", n: 1 } }, reduceGeneric: 2 },
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0 },
      { kind: "draw", amount: 1 },
    ],
  },
});
