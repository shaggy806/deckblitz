import { defineCard } from "../define.js";

const HEXPROOF_TEXT = "This creature has hexproof as long as it hasn't dealt damage yet.";

export default defineCard({
  name: "Karakyk Guardian",
  manaCost: "{3}{G}{U}{R}",
  colors: ["G", "U", "R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 6,
  toughness: 5,
  keywords: ["flying", "vigilance", "trample"],
  text: `Flying, vigilance, trample\n${HEXPROOF_TEXT} (It can't be the target of spells or abilities your opponents control.)`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "self-hasnt-dealt-damage" },
      grantKeywords: ["hexproof"],
      text: HEXPROOF_TEXT,
    },
  ],
});
