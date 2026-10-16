import { defineCard } from "../define.js";

// EDHREC rank 8052. Modern Horizons 3.
//
// "A card for each Locus you control" counts Trenchpost itself, read as the
// ability resolves.
const MILL_TEXT = "{3}, {T}: Target player mills a card for each Locus you control.";

export default defineCard({
  name: "Trenchpost",
  colors: [],
  types: ["land"],
  subtypes: ["Locus"],
  text: `{T}: Add {C}.\n${MILL_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{3}", tap: true },
      targets: ["player"],
      effect: { kind: "mill", target: 0, amount: { countOf: { subtype: "Locus", controlledBy: "you" } } },
      resolve: null,
      text: MILL_TEXT,
    },
  ],
});
