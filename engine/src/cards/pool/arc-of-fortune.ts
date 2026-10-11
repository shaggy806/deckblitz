import { defineCard } from "../define.js";

// Variable Chaser's prepare spell (rule 722): no card of its own, only ever
// cast as the copy a prepared Chaser makes in exile (722.3c). Each player is
// asked in turn order, as Will of the Jeskai's wheel is.
export default defineCard({
  name: "Arc of Fortune",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  prepareSpellOnly: true,
  text: "Each player may discard their hand and draw seven cards.",
  effect: {
    kind: "each-player-may",
    who: "each-player",
    prompt: "Discard your hand and draw seven cards?",
    effect: {
      kind: "sequence",
      effects: [
        { kind: "discard-hand", who: "you" },
        { kind: "draw", amount: 7 },
      ],
    },
  },
});
