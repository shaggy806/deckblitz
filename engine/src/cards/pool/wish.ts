import { defineCard } from "../define.js";

// EDHREC rank 23079.

// Outside the game is its owner's sideboard (rule 400.11a), none in a
// Commander game (903.5e). The card is chosen as it's played, not as Wish
// resolves, and is played with its costs and timing (its rulings): one play
// this turn under the permission (`upTo: 1`).
export default defineCard({
  name: "Wish",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "You may play a card you own from outside the game this turn.",
  targets: [],
  effect: { kind: "player-effect", duration: "end-of-turn", mayPlay: { from: "outside", play: true, upTo: 1 } },
});
