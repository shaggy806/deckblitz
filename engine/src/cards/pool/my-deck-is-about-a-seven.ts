import { defineCard } from "../define.js";

// Playtest card. The number is chosen as the spell resolves (6, 7 or 8 —
// "between" inclusive), then dealt as damage.

export default defineCard({
  name: "My Deck is About a Seven",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Choose a number between 6 and 8. My Deck is About a Seven deals that much damage to target creature.",
  targets: ["creature"],
  effect: {
    kind: "choose-value",
    value: "number",
    min: 6,
    max: 8,
    prompt: "Choose a number between 6 and 8",
    then: { kind: "damage", amount: "x", target: 0 },
  },
});
