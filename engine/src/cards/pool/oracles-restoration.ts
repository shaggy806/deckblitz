import { defineCard } from "../define.js";

// EDHREC rank 13720. With the target gone it doesn't resolve at all — no card,
// no life (the ruling).
export default defineCard({
  name: "Oracle's Restoration",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Target creature you control gets +1/+1 until end of turn. You draw a card and gain 1 life.",
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      { kind: "draw", amount: 1 },
      { kind: "gain-life", amount: 1 },
    ],
  },
});
