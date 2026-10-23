import { defineCard } from "../define.js";

// EDHREC rank 8148.

const LIFE_TEXT = "{3}, {T}, Sacrifice a creature: You gain life equal to the sacrificed creature's toughness.";

export default defineCard({
  name: "Miren, the Moaning Well",
  colors: [],
  supertypes: ["legendary"],
  types: ["land"],
  text: `{T}: Add {C}.\n${LIFE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{3}", tap: true, sacrifice: "creature-you-control" },
      targets: [],
      effect: { kind: "gain-life", amount: { toughnessOf: "sacrificed" } },
      resolve: null,
      text: LIFE_TEXT,
    },
  ],
});
