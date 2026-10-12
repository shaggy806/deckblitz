import { defineCard } from "../define.js";

export default defineCard({
  name: "Caldera Lake",
  colors: [],
  types: ["land"],
  text: "This land enters tapped.\n{T}: Add {C}.\n{T}: Add {U} or {R}. This land deals 1 damage to you.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["U", "R"] }, amount: 1, painToController: 1 },
      resolve: null,
      text: "{T}: Add {U} or {R}. This land deals 1 damage to you.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
});
