import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// EDHREC rank 21579.
//
// Rulings:
//   If you chose at least one target and all targets are illegal as Urborg Uprising tries to
//     resolve, the spell won't resolve and you won't draw a card.
//   You can cast Urborg Uprising with no targets if you want to only draw a card.

export default defineCard({
  name: "Urborg Uprising",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Return up to two target creature cards from your graveyard to your hand.\nDraw a card.",
  targets: distinctTargets(2, { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }, { optional: true }),
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "return-to-hand", target: 0, from: "graveyard" },
          { kind: "return-to-hand", target: 1, from: "graveyard" },
        ],
      },
      { kind: "draw", amount: 1 },
    ],
  },
});
