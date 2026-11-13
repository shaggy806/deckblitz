import { defineCard } from "../define.js";

// EDHREC 3542 (batch 315). Each player draws in turn order from the active
// player; then each one's three cards are picked at random in that order,
// and all of them are discarded at the same time (its rulings, rule 101.4) —
// one held discard, released at once. A player who couldn't draw still
// discards three.
export default defineCard({
  name: "Burning Inquiry",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Each player draws three cards, then discards three cards at random.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 3, who: "each-player" },
      { kind: "discard", target: "each-player", amount: 3, random: true },
    ],
  },
});
