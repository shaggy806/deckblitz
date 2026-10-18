import { defineCard } from "../define.js";

// EDHREC rank 8001.

export default defineCard({
  name: "Marshal of Zhalfir",
  manaCost: "{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  text: "Other Knights you control get +1/+1.\n{W}{U}, {T}: Tap another target creature.",
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", subtype: "Knight", controlledBy: "you" },
        excludeSelf: true,
      },
      grantPt: [1, 1],
      text: "Other Knights you control get +1/+1.",
    },
  ],
  activated: [
    {
      cost: { mana: "{W}{U}", tap: true },
      targets: [{ kind: "other", of: "creature" }],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "{W}{U}, {T}: Tap another target creature.",
    },
  ],
});
