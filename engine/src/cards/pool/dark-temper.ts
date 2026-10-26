import { defineCard } from "../define.js";

// Conflux (CON). EDHREC rank 27633.
//
// Rulings: a self-replacement checked as it resolves — with a black
// permanent it deals no damage at all and only destroys.

export default defineCard({
  name: "Dark Temper",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Dark Temper deals 2 damage to target creature. If you control a black permanent, destroy the creature instead.",
  targets: ["creature"],
  effect: {
    kind: "conditional",
    condition: { kind: "controls", filter: { colors: ["B"] }, atLeast: 1 },
    then: { kind: "destroy", target: 0 },
    else: { kind: "damage", amount: 2, target: 0 },
  },
});
