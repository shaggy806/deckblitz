import { defineCard } from "../define.js";

// EDHREC rank 11744.
// Makes Myr → "Myr Token".
//
// "Draw a card for each artifact you control" is counted as the attack
// trigger resolves (Infinite Guideline Station's shape) — Memnarch, an
// artifact itself, counts.

const ENTER_TEXT = "When Memnarch enters, create two 1/1 colorless Myr artifact creature tokens.";
const ATTACK_TEXT = "Whenever Memnarch attacks, draw a card for each artifact you control.";

export default defineCard({
  name: "Memnarch, the Warden",
  manaCost: "{10}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Wizard"],
  power: 8,
  toughness: 9,
  keywords: ["indestructible"],
  text: `Indestructible\n${ENTER_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Myr Token", count: 2 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: { countOf: { type: "artifact", controlledBy: "you" } } },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
