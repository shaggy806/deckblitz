import { defineCard } from "../define.js";

// EDHREC rank 10095. Any nonland card put into a graveyard this turn, from
// anywhere. The copy is cast now or never (the rulings).
export default defineCard({
  name: "Reenact the Crime",
  manaCost: "{1}{U}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Exile target nonland card in a graveyard that was put there from anywhere this turn. Copy it. You may cast the copy without paying its mana cost.",
  targets: [
    {
      kind: "card-in-graveyard",
      whose: "any",
      filter: { notTypes: ["land"], putIntoGraveyardThisTurn: {} },
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      { kind: "cast-now", from: "exiled-this-way", copies: 1, free: true },
    ],
  },
});
