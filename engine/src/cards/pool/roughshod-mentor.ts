import { defineCard } from "../define.js";

// EDHREC rank 24888.

const TEXT = "Green creatures you control have trample.";

export default defineCard({
  name: "Roughshod Mentor",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Giant", "Warrior"],
  power: 5,
  toughness: 4,
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["G"], controlledBy: "you" } },
      grantKeywords: ["trample"],
      text: TEXT,
    },
  ],
});
