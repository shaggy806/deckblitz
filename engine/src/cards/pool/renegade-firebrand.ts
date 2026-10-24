import { defineCard } from "../define.js";

// Kaladesh (Planeswalker Deck). EDHREC rank 27854. Karplusan Hound's Chandra
// check, as a static.
const TEXT =
  "As long as you control a Chandra planeswalker, this creature gets +1/+0 and has first strike. (It deals combat damage before creatures without first strike.)";

export default defineCard({
  name: "Renegade Firebrand",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "planeswalker", subtype: "Chandra" }, atLeast: 1 },
      grantPt: [1, 0],
      grantKeywords: ["first-strike"],
      text: TEXT,
    },
  ],
});
