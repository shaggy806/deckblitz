import { defineCard } from "../define.js";

// Commander 2021 (C21). The X cards are exiled; one instant or sorcery with
// mana value X or less may be cast from among them as this resolves; then the
// instants and sorceries still exiled go to your hand and everything else
// still exiled to the bottom in a random order.
//
// Rulings:
//   [2021-04-16] If you cast a spell with {X} in its cost without paying its mana cost, you must
//     choose 0 as the value of X.
//   [2021-04-16] You don't have to cast an instant or sorcery spell this way. If you don't, all
//     exiled instant or sorcery cards will be put into your hand.

export default defineCard({
  name: "Muse Vortex",
  manaCost: "{X}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Exile the top X cards of your library. You may cast an instant or sorcery spell with mana value X or less from among them without paying its mana cost. Then put the exiled instant and sorcery cards that weren't cast this way into your hand and the rest on the bottom of your library in a random order.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile-from-library", amount: "x" },
      {
        kind: "cast-now",
        from: "exiled-this-way",
        free: true,
        spell: { typesAnyOf: ["instant", "sorcery"], manaValue: { op: "lte", n: { amount: "x" } } },
      },
      { kind: "move-exiled-this-way", to: "hand", filter: { typesAnyOf: ["instant", "sorcery"] } },
      { kind: "move-exiled-this-way", to: "library-bottom" },
    ],
  },
});
