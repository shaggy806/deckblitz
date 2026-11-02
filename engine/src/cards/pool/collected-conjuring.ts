import { defineCard } from "../define.js";

export default defineCard({
  name: "Collected Conjuring",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  types: ["sorcery"],
  text: "Exile the top six cards of your library. You may cast up to two sorcery spells with mana value 3 or less from among them without paying their mana costs. Put the exiled cards not cast this way on the bottom of your library in a random order.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile-from-library", amount: 6 },
      {
        kind: "cast-now",
        from: "exiled-this-way",
        repeat: true,
        upTo: 2,
        free: true,
        spell: { type: "sorcery", manaValue: { op: "lte", n: 3 } },
      },
      { kind: "move-exiled-this-way", to: "library-bottom" },
    ],
  },
});
