import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 26441. Slate Street Ruffian's
// trigger: once however many creatures block it (the ruling).

const TEXT = "Whenever this creature becomes blocked, defending player discards a card.";

export default defineCard({
  name: "Alley Grifters",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Mercenary"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: { kind: "discard", target: "trigger-player", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
