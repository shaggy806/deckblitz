import { defineCard } from "../define.js";

// Divine Visitation's replacement, for artifact tokens: only a token that
// would be created an artifact, its characteristics replaced whole, while
// tapped, attacking, "it gains haste" and its later sacrifice or exile still
// happen.
const TEXT =
  "If one or more artifact tokens would be created under your control, that many 5/5 red Dragon creature tokens with flying are created instead.";

export default defineCard({
  name: "Draconic Visitor",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-create-token",
        tokensInstead: "Dragon Token",
        ofTokens: { type: "artifact" },
      },
      text: TEXT,
    },
  ],
});
