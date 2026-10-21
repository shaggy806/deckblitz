import { defineCard } from "../define.js";

// EDHREC rank 24529.

export default defineCard({
  name: "Snare Tactician",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 3,
  text: "Whenever you cycle a card, tap target creature an opponent controls.",
  triggered: [
    {
      trigger: { on: "cycles", who: "you" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "Whenever you cycle a card, tap target creature an opponent controls.",
    },
  ],
});
