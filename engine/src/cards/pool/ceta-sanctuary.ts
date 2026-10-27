import { defineCard } from "../define.js";

// Apocalypse (APC). The intervening if is a red or a green permanent; with
// both, the two-card draw replaces the one-card draw — one or two cards, never
// three (its ruling).
const TEXT =
  "At the beginning of your upkeep, if you control a red or green permanent, draw a card, then discard a card. If you control a red permanent and a green permanent, instead draw two cards, then discard a card.";
const RED = { kind: "controls", filter: { colors: ["R"] }, atLeast: 1 } as const;
const GREEN = { kind: "controls", filter: { colors: ["G"] }, atLeast: 1 } as const;

export default defineCard({
  name: "Ceta Sanctuary",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "any", of: [RED, GREEN] },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "all", of: [RED, GREEN] },
        then: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 2 },
            { kind: "discard", target: "you", amount: 1 },
          ],
        },
        else: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 1 },
            { kind: "discard", target: "you", amount: 1 },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
