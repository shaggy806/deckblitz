import { defineCard } from "../define.js";

// EDHREC rank 24001. Secrets of Strixhaven.
//
// "If you do" is the draw having happened: with an empty library nothing is
// drawn, so nothing is discarded (rule 608.2c).
const TEXT = "Whenever this creature enters or attacks, you may draw a card. If you do, discard a card.";
const LOOT = {
  kind: "may",
  prompt: "Draw a card, then discard a card?",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 1 },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "drawn", who: "you" },
        then: { kind: "discard", target: "you", amount: 1 },
      },
    ],
  },
} as const;

export default defineCard({
  name: "Stadium Tidalmage",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Djinn", "Sorcerer"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect: LOOT, resolve: null, text: TEXT },
    { trigger: { on: "attacks", who: "self" }, targets: [], effect: LOOT, resolve: null, text: TEXT },
  ],
});
