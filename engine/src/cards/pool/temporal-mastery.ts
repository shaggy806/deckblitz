import { defineCard } from "../define.js";

// EDHREC rank 2658.

export default defineCard({
  name: "Temporal Mastery",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  miracle: { cost: "{1}{U}" },
  text: "Take an extra turn after this one. Exile Temporal Mastery.\nMiracle {1}{U} (You may cast this card for its miracle cost when you draw it if it's the first card you drew this turn.)",
  exileOnResolve: true,
  effect: { kind: "take-extra-turn" },
});
