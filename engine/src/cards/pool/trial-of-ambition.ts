import { defineCard } from "../define.js";

// Amonkhet. EDHREC rank 25225.
//
// Rulings:
//   The Trial is returned to its owner's hand only if it's on the battlefield
//   as the ability resolves.

const ETB = "When this enchantment enters, target opponent sacrifices a creature of their choice.";
const CARTOUCHE = "When a Cartouche you control enters, return this enchantment to its owner's hand.";

export default defineCard({
  name: "Trial of Ambition",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${ETB}\n${CARTOUCHE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: { kind: "sacrifice", who: "target", filter: { type: "creature" }, count: 1 },
      resolve: null,
      text: ETB,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Cartouche" } },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: CARTOUCHE,
    },
  ],
});
