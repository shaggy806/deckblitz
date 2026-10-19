import { defineCard } from "../define.js";

// EDHREC rank 11239.

export default defineCard({
  name: "Stirring Bard",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon", "Bard"],
  power: 0,
  toughness: 4,
  keywords: ["defender"],
  text: "Defender\nWhen this creature enters, you take the initiative.\nMantle of Inspiration — {T}: Target creature gains menace and haste until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "menace", duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "Mantle of Inspiration — {T}: Target creature gains menace and haste until end of turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "take-initiative" },
      resolve: null,
      text: "When this creature enters, you take the initiative.",
    },
  ],
});
