import { defineCard } from "../define.js";

// EDHREC rank 16505. Return to Ravnica.

const TEXT = "During turns other than yours, tapped creatures you control have hexproof.";

export default defineCard({
  name: "Oak Street Innkeeper",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf"],
  power: 1,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", tapped: true } },
      condition: { kind: "not", of: { kind: "your-turn" } },
      grantKeywords: ["hexproof"],
      text: TEXT,
    },
  ],
});
