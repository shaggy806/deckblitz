import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 12358.
//
// The damage counts every card the target player drew this turn, the two
// just drawn included (a per-player turn stat read off target slot 0).

export default defineCard({
  name: "Cerebral Vortex",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  types: ["instant"],
  text: "Target player draws two cards, then Cerebral Vortex deals damage to that player equal to the number of cards they've drawn this turn.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 2, target: 0 },
      { kind: "damage", amount: { turnStat: "cards-drawn", target: 0 }, target: 0 },
    ],
  },
});
