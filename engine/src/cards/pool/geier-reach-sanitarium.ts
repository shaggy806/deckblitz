import { defineCard } from "../define.js";

// EDHREC rank 447.
//
// Lore Broker's shape: every player draws, then each sets a card aside face
// down in turn order from the active player and all are discarded at once
// (the ruling; rule 101.4).
export default defineCard({
  name: "Geier Reach Sanitarium",
  colors: [],
  supertypes: ["legendary"],
  types: ["land"],
  text: "{T}: Add {C}.\n{2}, {T}: Each player draws a card, then discards a card.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{2}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1, who: "each-player" },
          { kind: "discard", target: "each-player", amount: 1 },
        ],
      },
      resolve: null,
      text: "{2}, {T}: Each player draws a card, then discards a card.",
    },
  ],
});
