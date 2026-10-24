import { defineCard } from "../define.js";

export default defineCard({
  name: "Blighted Steppe",
  colors: [],
  types: ["land"],
  text: "{T}: Add {C}.\n{3}{W}, {T}, Sacrifice this land: You gain 2 life for each creature you control.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      // Counted as it resolves (the ruling).
      cost: { mana: "{3}{W}", tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: { countOf: { type: "creature", controlledBy: "you" }, times: 2 } },
      resolve: null,
      text: "{3}{W}, {T}, Sacrifice this land: You gain 2 life for each creature you control.",
    },
  ],
});
