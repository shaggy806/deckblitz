import { defineCard } from "../define.js";

// EDHREC rank 26431.

const TEXT = "Whenever this creature becomes blocked, defending player discards a card.";

export default defineCard({
  name: "Slate Street Ruffian",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
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
