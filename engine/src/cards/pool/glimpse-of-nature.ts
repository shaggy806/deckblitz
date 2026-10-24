import { defineCard } from "../define.js";

// EDHREC rank 7645. A delayed triggered ability for the rest of the turn
// (rule 603.7c): it resolves before the creature spell that fired it, even
// if that spell is countered (the ruling).
const TEXT = "Whenever you cast a creature spell this turn, draw a card.";

export default defineCard({
  name: "Glimpse of Nature",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "delayed-trigger",
    at: { whenever: { on: "cast-spell", who: "you", filter: { type: "creature" } } },
    effect: { kind: "draw", amount: 1 },
    text: TEXT,
  },
});
