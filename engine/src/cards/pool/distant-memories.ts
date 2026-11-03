import { defineCard } from "../define.js";

// "Any opponent may have you put that card into your hand": one `unless` over a
// scope, each asked in turn order (rule 101.4) until one says yes. With no card
// exiled (an empty library) there's nothing to have put there (rule 608.2d), so
// no one does and you draw. Browbeat's shape.
export default defineCard({
  name: "Distant Memories",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text:
    "Search your library for a card, exile it, then shuffle. Any opponent may have you put that card into your hand. " +
    "If no player does, you draw three cards.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "search-library", filter: {}, destination: "exile", min: 1, max: 1 },
      {
        kind: "unless",
        chooser: { anyOf: "each-opponent" },
        options: [
          {
            doing: { kind: "move-exiled-this-way", to: "hand" },
            text: "Have them put the exiled card into their hand",
          },
        ],
        otherwise: { kind: "draw", amount: 3 },
      },
    ],
  },
});
