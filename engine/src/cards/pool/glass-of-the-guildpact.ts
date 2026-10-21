import { defineCard } from "../define.js";

// Ravnica Allegiance.
const TEXT = "Multicolored creatures you control get +1/+1.";

export default defineCard({
  name: "Glass of the Guildpact",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", multicolored: true } },
      grantPt: [1, 1],
      text: TEXT,
    },
  ],
});
