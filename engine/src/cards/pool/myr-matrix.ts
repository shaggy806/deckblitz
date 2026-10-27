import { defineCard } from "../define.js";

// EDHREC rank 9682. "Myr creatures get +1/+1" is every Myr creature on the
// battlefield, whoever controls it, this one's tokens included.

export default defineCard({
  name: "Myr Matrix",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  keywords: ["indestructible"],
  text: "Indestructible (Effects that say \"destroy\" don't destroy this artifact.)\nMyr creatures get +1/+1.\n{5}: Create a 1/1 colorless Myr artifact creature token.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Myr" } },
      grantPt: [1, 1],
      text: "Myr creatures get +1/+1.",
    },
  ],
  activated: [
    {
      cost: { mana: "{5}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Myr Token", count: 1 },
      resolve: null,
      text: "{5}: Create a 1/1 colorless Myr artifact creature token.",
    },
  ],
});
