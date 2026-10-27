import { defineCard } from "../define.js";

// EDHREC rank 5487. "Up to one target": with no target chosen, it still
// draws a card.

const TEXT =
  "{T}, Sacrifice this artifact: Put up to one target card from your graveyard on the bottom of your library. Draw a card.";

export default defineCard({
  name: "Conjurer's Bauble",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: [{ kind: "optional", of: { kind: "card-in-graveyard", whose: "you" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "put-on-library", target: 0, position: "bottom" },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
