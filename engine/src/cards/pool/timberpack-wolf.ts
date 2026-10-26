import { defineCard } from "../define.js";

const TEXT = "This creature gets +1/+1 for each other creature you control named Timberpack Wolf.";

export default defineCard({
  name: "Timberpack Wolf",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: {
        filter: { type: "creature", controlledBy: "you", name: "Timberpack Wolf" },
        pt: [1, 1],
        excludeSelf: true,
      },
      text: TEXT,
    },
  ],
});
