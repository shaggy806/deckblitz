import { defineCard } from "../define.js";

// EDHREC rank 10188.

export default defineCard({
  name: "Deepmuck Desperado",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Homarid", "Mercenary"],
  power: 2,
  toughness: 4,
  text: "Whenever you commit a crime, each opponent mills three cards. This ability triggers only once each turn. (Targeting opponents, anything they control, and/or cards in their graveyards is a crime.)",
  triggered: [
    {
      trigger: { on: "crime-committed", who: "you" },
      targets: [],
      effect: { kind: "mill", target: "each-opponent", amount: 3 },
      resolve: null,
      text: "Whenever you commit a crime, each opponent mills three cards. This ability triggers only once each turn.",
      oncePerTurn: true,
    },
  ],
});
