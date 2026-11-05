import { defineCard } from "../define.js";

// A 2/2 blue Spirit with vigilance that grows each time you draw — Teferi,
// Temporal Pilgrim's −2.
export default defineCard({
  name: "Spirit Token (Vigilance, Grows on Draw)",
  art: "349e3241-8f9d-4c52-9848-e01b575fd372",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 2,
  keywords: ["vigilance"],
  text: "Vigilance\nWhenever you draw a card, put a +1/+1 counter on this creature.",
  triggered: [
    {
      trigger: { on: "draws", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever you draw a card, put a +1/+1 counter on this creature.",
    },
  ],
});
