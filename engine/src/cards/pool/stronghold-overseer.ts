import { defineCard } from "../define.js";

// EDHREC rank 22730.

export default defineCard({
  name: "Stronghold Overseer",
  manaCost: "{3}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 5,
  toughness: 5,
  keywords: ["flying", "shadow"],
  text: "Flying\nShadow (This creature can block or be blocked by only creatures with shadow.)\n{B}{B}: Creatures with shadow get +1/+0 until end of turn and creatures without shadow get -1/-0 until end of turn.",
  activated: [
    {
      cost: { mana: "{B}{B}", tap: false },
      targets: [],
      // Neither half changes who has shadow, so the second reads the same
      // board the first did.
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt-all",
            filter: { type: "creature", keyword: "shadow" },
            power: 1,
            toughness: 0,
            duration: "end-of-turn",
          },
          {
            kind: "modify-pt-all",
            filter: { type: "creature", notKeyword: "shadow" },
            power: -1,
            toughness: 0,
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: "{B}{B}: Creatures with shadow get +1/+0 until end of turn and creatures without shadow get -1/-0 until end of turn.",
    },
  ],
});
