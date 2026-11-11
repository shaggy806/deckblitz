import { defineCard } from "../define.js";

// Rulings:
//   If you can't cast a card, perhaps because there are no legal targets available, or if you
//     choose not to cast it, it will be put into your graveyard.
//   When casting an instant or sorcery card this way, ignore timing restrictions based on the
//     card's type.

export default defineCard({
  name: "Epic Experiment",
  manaCost: "{X}{U}{R}",
  colors: ["U", "R"],
  types: ["sorcery"],
  text: "Exile the top X cards of your library. You may cast instant and sorcery spells with mana value X or less from among them without paying their mana costs. Then put all cards exiled this way that weren't cast into your graveyard.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile-from-library", amount: "x" },
      {
        kind: "cast-now",
        from: "exiled-this-way",
        free: true,
        repeat: true,
        spell: { typesAnyOf: ["instant", "sorcery"], manaValue: { op: "lte", n: { amount: "x" } } },
      },
      // Every card exiled this way that's still in exile goes to the graveyard: all of
      // them are chosen, none left to choose otherwise.
      {
        kind: "look-and-choose",
        zone: "exiled-this-way",
        min: { thisWay: "exiled" },
        max: { thisWay: "exiled" },
        destination: "graveyard",
        leftover: "stay",
      },
    ],
  },
});
