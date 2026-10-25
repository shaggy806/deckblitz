import { defineCard } from "../define.js";

// EDHREC rank 7630. The second sentence is a delayed triggered ability lasting
// the turn (rule 603.7c), read with the caster as its controller, so "an
// opponent" is the caster's; each copy resolved makes its own (the rulings).

const BLOCK_TEXT = "Until end of turn, whenever a creature an opponent controls blocks, draw a card.";

export default defineCard({
  name: "Benefactor's Draught",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: `Untap all creatures. ${BLOCK_TEXT}\nDraw a card.`,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "untap-all", filter: { type: "creature" } },
      {
        kind: "delayed-trigger",
        at: { whenever: { on: "blocks", who: "any", filter: { type: "creature", controlledBy: "opponent" } } },
        effect: { kind: "draw", amount: 1 },
        text: BLOCK_TEXT,
      },
      { kind: "draw", amount: 1 },
    ],
  },
});
