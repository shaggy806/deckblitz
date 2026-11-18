import { defineCard } from "../define.js";

// Future Sight (FUT). EDHREC rank 24271.
//
// Rulings:
//   If the target creature is an illegal target by the time Judge Unworthy tries to resolve, the
//     spell doesn't resolve. You don't scry 3 or reveal any card.
//   Destroying a blocking creature won't cause any of the creatures it was blocking to become
//     unblocked.
//
// Riddle of Lightning's shape, aimed at an attacking or blocking creature.
const TEXT =
  "Choose target attacking or blocking creature. Scry 3, then reveal the top card of your library. Judge Unworthy deals damage equal to that card's mana value to that creature.";
const REVEALED_MV = { aggregate: "sum", of: "mana-value", filter: {}, in: { thisWay: "revealed" } } as const;

export default defineCard({
  name: "Judge Unworthy",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: TEXT,
  targets: ["attacking-or-blocking-creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "scry", amount: 3 },
      { kind: "reveal-top", then: { kind: "sequence", effects: [] } },
      { kind: "damage", amount: REVEALED_MV, target: 0 },
    ],
  },
});
