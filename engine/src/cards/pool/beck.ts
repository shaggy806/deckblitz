import { defineCard } from "../define.js";

const FACES = ["Beck // Call", "Beck", "Call"];

// The left half of Beck // Call (see beck-call.ts).
export default defineCard({
  name: "Beck",
  manaCost: "{G}{U}",
  colors: ["U", "G"],
  types: ["sorcery"],
  text: "Whenever a creature enters this turn, you may draw a card.\nFuse (You may cast one or both halves of this card from your hand.)",
  targets: [],
  effect: {
    kind: "delayed-trigger",
    at: { whenever: { on: "enters-battlefield", who: "any", filter: { type: "creature" } } },
    effect: { kind: "may", prompt: "Draw a card?", effect: { kind: "draw", amount: 1 } },
    text: "Whenever a creature enters this turn, you may draw a card.",
  },
  faces: FACES,
  split: true,
});
