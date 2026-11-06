import { defineCard } from "../define.js";

// EDHREC rank 22189.

export default defineCard({
  name: "Command Subadjunct",
  manaCost: "{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Borg"],
  power: 2,
  toughness: 1,
  text: "Artifact creatures you control have vigilance.",
  static: [
    {
      affects: { scope: "filter", filter: { types: ["artifact", "creature"], controlledBy: "you" } },
      grantKeywords: ["vigilance"],
      text: "Artifact creatures you control have vigilance.",
    },
  ],
});
