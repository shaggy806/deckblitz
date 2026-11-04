import { defineCard } from "../define.js";

// With fewer than three cards in hand, they all go. The player puts them back in their chosen order.
const TEXT = "Target player chooses three cards from their hand and puts them on top of their library in any order.";

export default defineCard({
  name: "Stunted Growth",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: TEXT,
  targets: ["player"],
  effect: {
    kind: "for-each-player",
    who: { target: 0 },
    effect: {
      kind: "look-and-choose",
      zone: "hand",
      player: "that-player",
      min: 3,
      max: 3,
      destination: "library-top",
      leftover: "stay",
    },
  },
});
