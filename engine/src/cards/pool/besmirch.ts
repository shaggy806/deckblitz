import { defineCard } from "../define.js";

export default defineCard({
  name: "Besmirch",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Until end of turn, gain control of target creature and it gains haste. Untap and goad that creature. (Until your next turn, that creature attacks each combat if able and attacks a player other than you if able.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control", target: 0, untilEndOfTurn: true },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      { kind: "untap", target: 0 },
      { kind: "goad", target: 0 },
    ],
  },
});
