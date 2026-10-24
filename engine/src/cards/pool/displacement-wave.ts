import { defineCard } from "../define.js";

// EDHREC rank 12284.
//
// Rulings:
//   [2015-06-22] If a permanent has an {X} in its mana cost, that X is 0.
//   [2015-06-22] A token has mana value 0 unless it's a copy of something else, in which case it
//     has the mana cost of whatever it's copying.

export default defineCard({
  name: "Displacement Wave",
  manaCost: "{X}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Return all nonland permanents with mana value X or less to their owners' hands.",
  effect: {
    kind: "return-to-hand-all",
    filter: { notTypes: ["land"], manaValue: { op: "lte", n: "x" } },
  },
});
