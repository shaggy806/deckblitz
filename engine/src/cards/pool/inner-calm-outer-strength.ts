import { defineCard } from "../define.js";

// Saviors of Kamigawa (SOK). EDHREC rank 16704.

export default defineCard({
  name: "Inner Calm, Outer Strength",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  subtypes: ["Arcane"],
  text: "Target creature gets +X/+X until end of turn, where X is the number of cards in your hand.",
  targets: ["creature"],
  effect: {
    kind: "modify-pt",
    target: 0,
    power: { cardsInHand: "you" },
    toughness: { cardsInHand: "you" },
    duration: "end-of-turn",
  },
});
