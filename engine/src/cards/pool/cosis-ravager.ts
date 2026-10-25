import { defineCard } from "../define.js";

// EDHREC rank 16986.

const TEXT =
  "Landfall — Whenever a land you control enters, you may have this creature deal 1 damage to target player or planeswalker.";

export default defineCard({
  name: "Cosi's Ravager",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: ["player-or-planeswalker"],
      effect: {
        kind: "may",
        prompt: "Deal 1 damage to target player or planeswalker?",
        effect: { kind: "damage", amount: 1, target: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
