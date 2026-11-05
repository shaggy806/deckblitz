import { defineCard } from "../define.js";

const ANTHEM = "As long as your life total is greater than or equal to your starting life total, creatures you control get +1/+1.";
const ATTACK = "Whenever one or more creatures you control attack, you gain life equal to the number of attacking creatures.";

export default defineCard({
  name: "Path of Bravery",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${ANTHEM}\n${ATTACK}`,
  static: [
    {
      affects: { scope: "creatures-you-control" },
      condition: { kind: "life-total", atLeast: { startingPlus: 0 } },
      grantPt: [1, 1],
      text: ANTHEM,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks-batch", who: "you" },
      targets: [],
      // Counted as it resolves, so a creature that has since entered attacking
      // counts (the ruling).
      effect: { kind: "gain-life", amount: { countOf: { type: "creature", attacking: true } } },
      resolve: null,
      text: ATTACK,
    },
  ],
});
