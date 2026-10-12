import { defineCard } from "../define.js";

// EDHREC rank 7466.

export default defineCard({
  name: "Waterbending Scroll",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["artifact"],
  text: "{6}, {T}: Draw a card. This ability costs {1} less to activate for each Island you control.",
  activated: [
    {
      cost: { mana: "{6}", tap: true },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      costReduction: { reduceGeneric: { countOf: { subtype: "Island", controlledBy: "you" } } },
      resolve: null,
      text: "{6}, {T}: Draw a card. This ability costs {1} less to activate for each Island you control.",
    },
  ],
});
