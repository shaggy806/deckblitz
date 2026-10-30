import { defineCard } from "../define.js";

// Kaldheim. "At least 7 life more than your starting life total": 27 in a
// 20-life game, 47 in Commander (rule 103.4).

const GAIN = "Whenever another Angel or Cleric you control enters, you gain life equal to that creature's toughness.";
const ANTHEM = "As long as you have at least 7 life more than your starting life total, creatures you control get +2/+2.";

export default defineCard({
  name: "Righteous Valkyrie",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel", "Cleric"],
  power: 2,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${GAIN}\n${ANTHEM}`,
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        otherOnly: true,
        filter: { type: "creature", anyOf: [{ subtype: "Angel" }, { subtype: "Cleric" }] },
      },
      targets: [],
      effect: { kind: "gain-life", amount: { toughnessOf: "trigger-object" } },
      resolve: null,
      text: GAIN,
    },
  ],
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantPt: [2, 2],
      condition: { kind: "life-total", atLeast: { startingPlus: 7 } },
      text: ANTHEM,
    },
  ],
});
