import { defineCard } from "../define.js";

// EDHREC rank 14484.

export default defineCard({
  name: "Sprite Noble",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Faerie", "Noble"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nOther creatures you control with flying get +0/+1.\n{T}: Other creatures you control with flying get +1/+0 until end of turn.",
  static: [
    {
      affects: { scope: "creatures-you-control", withKeyword: "flying", excludeSelf: true },
      grantPt: [0, 1],
      text: "Other creatures you control with flying get +0/+1.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      // The affected set is fixed as it resolves (the ruling): a one-shot
      // modify-pt-all, not a static.
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you", keyword: "flying" },
        exceptSource: true,
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{T}: Other creatures you control with flying get +1/+0 until end of turn.",
    },
  ],
});
