import { defineCard } from "../define.js";

export default defineCard({
  name: "Encroaching Wastes",
  colors: [],
  types: ["land"],
  text: "{T}: Add {C}.\n{4}, {T}, Sacrifice this land: Destroy target nonbasic land.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{4}", tap: true, sacrifice: "self" },
      targets: [{ kind: "permanent", filter: { notSupertype: "basic", type: "land" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{4}, {T}, Sacrifice this land: Destroy target nonbasic land.",
    },
  ],
});
