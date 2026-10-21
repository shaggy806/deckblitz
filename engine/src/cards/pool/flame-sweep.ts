import { defineCard } from "../define.js";

// EDHREC rank 18541. Only creatures you control *with flying* are spared (the
// ruling): an opponent's fliers and your non-fliers are both hit.

export default defineCard({
  name: "Flame Sweep",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Flame Sweep deals 2 damage to each creature except for creatures you control with flying.",
  targets: [],
  effect: {
    kind: "damage-all",
    amount: 2,
    filter: { type: "creature", anyOf: [{ controlledBy: "opponent" }, { notKeyword: "flying" }] },
  },
});
