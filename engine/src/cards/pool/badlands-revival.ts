import { defineCard } from "../define.js";

// EDHREC rank 13051.
//
// Two sentences, two separate moves, each of its own optional slot. The same
// card may be both targets (rule 115.3, one "target" word each); once the
// first has put it onto the battlefield it's a new object (rule 400.7) and the
// second finds nothing to return.
const TEXT =
  "Return up to one target creature card from your graveyard to the battlefield. Return up to one target permanent card from your graveyard to your hand.";

export default defineCard({
  name: "Badlands Revival",
  manaCost: "{3}{B}{G}",
  colors: ["B", "G"],
  types: ["sorcery"],
  text: TEXT,
  targets: [
    { kind: "optional", of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } } },
    {
      kind: "optional",
      of: {
        kind: "card-in-graveyard",
        whose: "you",
        filter: { typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"] },
      },
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-onto-battlefield", target: 0 },
      { kind: "return-to-hand", target: 1, from: "graveyard" },
    ],
  },
});
