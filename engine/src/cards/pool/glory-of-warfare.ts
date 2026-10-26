import { defineCard } from "../define.js";

export default defineCard({
  name: "Glory of Warfare",
  manaCost: "{2}{R}{W}",
  colors: ["W", "R"],
  types: ["enchantment"],
  text: "During your turn, creatures you control get +2/+0.\nDuring turns other than yours, creatures you control get +0/+2.",
  static: [
    {
      affects: { scope: "creatures-you-control" },
      condition: { kind: "your-turn" },
      grantPt: [2, 0],
      text: "During your turn, creatures you control get +2/+0.",
    },
    {
      affects: { scope: "creatures-you-control" },
      condition: { kind: "not", of: { kind: "your-turn" } },
      grantPt: [0, 2],
      text: "During turns other than yours, creatures you control get +0/+2.",
    },
  ],
});
