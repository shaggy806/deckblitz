import { defineCard } from "../define.js";

// EDHREC rank 21403.

const TEXT = "Sliver creatures you control get +0/+1.";

export default defineCard({
  name: "Steelform Sliver",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [{ affects: { scope: "creatures-you-control", subtype: "Sliver" }, grantPt: [0, 1], text: TEXT }],
});
