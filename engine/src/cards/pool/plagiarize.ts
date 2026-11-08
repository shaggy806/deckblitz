import { defineCard } from "../define.js";

export default defineCard({
  name: "Plagiarize",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Until end of turn, if target player would draw a card, instead that player skips that draw and you draw a card.",
  targets: ["player"],
  effect: {
    kind: "replacement-effect",
    duration: "end-of-turn",
    players: { target: 0 },
    replacement: { event: "would-draw", who: "any-player", instead: { effect: { kind: "draw", amount: 1 } } },
  },
});
