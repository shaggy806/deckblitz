import { defineCard } from "../define.js";

// Three instructions, each for every player (rule 101.4): each player
// separates their nontoken lands, in turn order from the active player; then,
// player by player, they name one of their opponents, who chooses one of their
// piles; then every chosen pile is destroyed at once, and every other pile
// tapped. A player with no nontoken lands has two empty piles (rule 700.3d).
export default defineCard({
  name: "Bend or Break",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Each player separates all nontoken lands they control into two piles. For each player, one of their piles is chosen by one of their opponents of their choice. Destroy all lands in the chosen piles. Tap all lands in the other piles.",
  targets: [],
  effect: {
    kind: "separate-into-piles",
    each: "each-player",
    objects: { permanents: { type: "land", token: false }, whose: "that-player" },
    chooser: "an-opponent",
    chosen: { effect: { kind: "destroy", target: 0 } },
    rest: { effect: { kind: "tap", target: 0 } },
  },
});
