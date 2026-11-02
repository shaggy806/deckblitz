import { defineCard } from "../define.js";

const TEXT = "Whenever this token attacks or blocks, each opponent exiles the top two cards of their library.";

/** Ashiok, Nightmare Muse's +1. */
export default defineCard({
  name: "Nightmare Token (Ashiok)",
  tokenName: "Nightmare Token",
  art: "c528581f-f671-45ae-8d7a-ae26a4e62ceb",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Nightmare"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "exile-from-library", whose: "each-opponent", amount: 2 },
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "blocks", who: "self" },
      targets: [],
      effect: { kind: "exile-from-library", whose: "each-opponent", amount: 2 },
      resolve: null,
      text: TEXT,
    },
  ],
});
