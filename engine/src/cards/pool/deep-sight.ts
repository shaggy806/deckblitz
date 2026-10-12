import { defineCard } from "../define.js";

// Tam, Observant Sequencer's prepare spell (rule 722): no card of its own,
// only ever cast as the copy a prepared Tam makes in exile (722.3c).
export default defineCard({
  name: "Deep Sight",
  manaCost: "{G}{U}",
  colors: ["U", "G"],
  types: ["sorcery"],
  prepareSpellOnly: true,
  text: "You draw a card and gain 1 life.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 1 },
      { kind: "gain-life", amount: 1 },
    ],
  },
});
