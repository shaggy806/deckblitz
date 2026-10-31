import { defineCard } from "../define.js";

// "That many" is each player's own: the cards that player shuffled in from
// their hand, drawn once every library is shuffled.
export default defineCard({
  name: "Winds of Change",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Each player shuffles the cards from their hand into their library, then draws that many cards.",
  targets: [],
  effect: { kind: "shuffle-graveyard-into-library", target: "each-player", zones: ["hand"], drawThatMany: true },
});
