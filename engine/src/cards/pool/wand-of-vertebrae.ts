import { defineCard } from "../define.js";

// EDHREC rank 12595.
//
// Ghostly Castigator's shuffle, without the "may": the targeted cards go
// into the library together, then it's shuffled.
const SHUFFLE_TEXT =
  "{2}, {T}, Exile this artifact: Shuffle up to five target cards from your graveyard into your library.";

export default defineCard({
  name: "Wand of Vertebrae",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: `{T}: Mill a card.\n${SHUFFLE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "mill", target: "you", amount: 1 },
      resolve: null,
      text: "{T}: Mill a card.",
    },
    {
      cost: { mana: "{2}", tap: true, exileSelf: true },
      targets: [{ kind: "any-number", of: { kind: "card-in-graveyard", whose: "you" }, max: 5 }],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "for-each-target",
            from: 0,
            simultaneous: true,
            effect: { kind: "put-on-library", target: 0, position: "top" },
          },
          { kind: "shuffle-library" },
        ],
      },
      resolve: null,
      text: SHUFFLE_TEXT,
    },
  ],
});
