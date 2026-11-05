import { defineCard } from "../define.js";

// EDHREC rank 18652.

export default defineCard({
  name: "Palladia-Mors, the Ruiner",
  manaCost: "{3}{R}{G}{W}",
  colors: ["W", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elder", "Dragon"],
  power: 6,
  toughness: 6,
  keywords: ["flying", "vigilance", "trample"],
  text: "Flying, vigilance, trample\nPalladia-Mors has hexproof as long as it hasn't dealt damage yet.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "self-hasnt-dealt-damage" },
      grantKeywords: ["hexproof"],
      text: "Palladia-Mors has hexproof as long as it hasn't dealt damage yet.",
    },
  ],
});
