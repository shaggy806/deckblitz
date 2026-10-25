import { defineCard } from "../define.js";

export default defineCard({
  name: "Tendo Ice Bridge",
  colors: [],
  types: ["land"],
  text: "This land enters with a charge counter on it.\n{T}: Add {C}.\n{T}, Remove a charge counter from this land: Add one mana of any color.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "charge", count: 1 } },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}, Remove a charge counter from this land: Add one mana of any color.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "charge", amount: 1 } },
      text: "This land enters with a charge counter on it.",
    },
  ],
});
