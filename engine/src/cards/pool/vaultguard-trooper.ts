import { defineCard } from "../define.js";

// Rulings:
//   The intervening "if" is checked as your end step starts (or the ability
//   doesn't trigger at all) and again as it resolves (rule 603.4 — the
//   trigger's `condition`). It counts this creature too, if it's tapped.
//   As with Jackdaw and Narset, Jeskai Waymaster, you may choose to discard
//   your hand even if it's empty (their rulings), and then you draw two.

const TEXT =
  "At the beginning of your end step, if you control two or more tapped creatures, you may discard your hand. If you do, draw two cards.";

export default defineCard({
  name: "Vaultguard Trooper",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Kavu", "Soldier"],
  power: 5,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "controls", filter: { type: "creature", tapped: true }, atLeast: 2 },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard your hand, then draw two cards?",
        effect: { kind: "discard-hand", who: "you" },
        then: { kind: "draw", amount: 2 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
