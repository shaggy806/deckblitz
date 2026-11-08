import { defineCard } from "../define.js";

export default defineCard({
  name: "Equal Treatment",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "If any source would deal 1 or more damage to a permanent or player this turn, it deals 2 damage to that permanent or player instead.\nDraw a card.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "replacement-effect", duration: "end-of-turn", replacement: { event: "would-deal-damage", instead: { modify: { set: 2 } } } },
      { kind: "draw", amount: 1 },
    ],
  },
});
