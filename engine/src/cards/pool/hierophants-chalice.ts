import { defineCard } from "../define.js";

export default defineCard({
  name: "Hierophant's Chalice",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "When this artifact enters, target opponent loses 1 life and you gain 1 life.\n{T}: Add {C}.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [{ kind: "lose-life", amount: 1, target: 0 }, { kind: "gain-life", amount: 1 }],
      },
      resolve: null,
      text: "When this artifact enters, target opponent loses 1 life and you gain 1 life.",
    },
  ],
});
