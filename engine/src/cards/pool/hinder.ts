import { defineCard } from "../define.js";

// Ruling: Hinder's controller, not necessarily the controller of the countered spell, chooses
// where the countered spell goes. The answer changes nothing for a spell that can't be countered.
export default defineCard({
  name: "Hinder",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell. If that spell is countered this way, put that card on your choice of the top or bottom of its owner's library instead of into that player's graveyard.",
  targets: ["spell"],
  effect: {
    kind: "each-player-may",
    who: "you",
    choices: [
      { text: "Put it on top of its owner's library.", effect: { kind: "counter", target: 0, into: "library-top" } },
      { text: "Put it on the bottom of its owner's library.", effect: { kind: "counter", target: 0, into: "library-bottom" } },
    ],
  },
});
