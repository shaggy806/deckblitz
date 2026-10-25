import { defineCard } from "../define.js";

// EDHREC rank 19619. Eldritch Moon.

export default defineCard({
  name: "Drownyard Behemoth",
  manaCost: "{9}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Crab"],
  power: 5,
  toughness: 7,
  keywords: ["flash"],
  alternativeCost: { mana: "{7}{U}", keyword: "emerge", emerge: { filter: { type: "creature" } } },
  text: "Flash (You may cast this spell any time you could cast an instant.)\nEmerge {7}{U} (You may cast this spell by sacrificing a creature and paying the emerge cost reduced by that creature's mana value.)\nThis creature has hexproof as long as it entered this turn.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { enteredThisTurn: true } },
      grantKeywords: ["hexproof"],
      text: "This creature has hexproof as long as it entered this turn.",
    },
  ],
});
