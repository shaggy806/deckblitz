import { defineCard } from "../define.js";

// EDHREC rank 13303.
//
// Rulings:
//   [2025-04-04] You don’t choose a target for Glacial Dragonhunt at the time you cast it. Rather,
//     a second “reflexive” ability triggers when you discard a nonland card this way. You choose a
//     target for that ability as it goes on the stack. Each player may respond to this triggered
//     ability as normal.
//   (and the harmonize rulings, which the `harmonize` field runs.)
//
// Narset of the Ancient Way's shape: the draw, then the "may" discard, and
// only a nonland card discarded fires the reflexive trigger, its target chosen
// as it goes on the stack.

const DRAW_TEXT =
  "Draw a card, then you may discard a card. When you discard a nonland card this way, Glacial Dragonhunt deals 3 damage to target creature.";
const HARMONIZE_TEXT =
  "Harmonize {4}{U}{R} (You may cast this card from your graveyard for its harmonize cost. You may tap a creature you control to reduce that cost by {X}, where X is its power. Then exile this spell.)";

export default defineCard({
  name: "Glacial Dragonhunt",
  manaCost: "{U}{R}",
  colors: ["U", "R"],
  types: ["sorcery"],
  text: `${DRAW_TEXT}\n${HARMONIZE_TEXT}`,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 1 },
      {
        kind: "may",
        prompt: "Discard a card?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded", filter: { notTypes: ["land"] } },
              then: {
                kind: "reflexive-trigger",
                targets: ["creature"],
                effect: { kind: "damage", amount: 3, target: 0 },
                text: "When you discard a nonland card this way, Glacial Dragonhunt deals 3 damage to target creature.",
              },
            },
          ],
        },
      },
    ],
  },
  harmonize: { cost: "{4}{U}{R}" },
});
