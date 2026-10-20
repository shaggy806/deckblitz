import { defineCard } from "../define.js";

// Kaldheim (KHM). EDHREC rank 22509.
//
// "Draw cards equal to the difference": 2 minus the cards discarded this way, never below 0
// (rule 107.1b) — so the "if fewer than two" gate is the difference being positive.
export default defineCard({
  name: "Skull Raid",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target opponent discards two cards. If fewer than two cards were discarded this way, you draw cards equal to the difference.\nForetell {1}{B} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later turn for its foretell cost.)",
  foretell: { cost: "{1}{B}" },
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard", target: 0, amount: 2 },
      { kind: "draw", amount: { difference: [2, { thisWay: "discarded" }] } },
    ],
  },
});
