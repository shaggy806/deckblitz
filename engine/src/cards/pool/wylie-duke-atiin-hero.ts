import { defineCard } from "../define.js";

// EDHREC rank 7977.
const TAP_TEXT = "Whenever Wylie Duke becomes tapped, you gain 1 life and draw a card.";

export default defineCard({
  name: "Wylie Duke, Atiin Hero",
  manaCost: "{1}{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Ranger"],
  power: 4,
  toughness: 2,
  keywords: ["vigilance"],
  text: `Vigilance\n${TAP_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 1 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
});
