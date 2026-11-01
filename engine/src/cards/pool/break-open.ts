import { defineCard } from "../define.js";

// An opponent's face-down creature, turned up with nothing paid. An instant or
// sorcery card under it is revealed and stays face down (rules 701.40g,
// 701.58g).

export default defineCard({
  name: "Break Open",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Turn target face-down creature an opponent controls face up.",
  targets: [{ kind: "permanent", filter: { type: "creature", faceDown: true, controlledBy: "opponent" } }],
  effect: { kind: "turn-face-up", target: 0 },
});
