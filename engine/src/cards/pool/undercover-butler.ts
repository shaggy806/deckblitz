import { defineCard } from "../define.js";

// EDHREC rank 29323.
//
// Dethrone's trigger condition (`defenderLife: "most"` — every player
// compared, you included): asked as it attacks and never again, so life
// totals changing before it resolves don't stop it (the ruling). Attacking a
// planeswalker never meets it (the ruling, rule 508.3a).

const ATTACK_TEXT =
  "Whenever this creature attacks the player with the most life or tied for most life, it can't be blocked this turn.";

export default defineCard({
  name: "Undercover Butler",
  manaCost: "{2}{U/B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 3,
  text: ATTACK_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self", defenderLife: "most" },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
