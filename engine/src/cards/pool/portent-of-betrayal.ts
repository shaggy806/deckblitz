import { defineCard } from "../define.js";

// EDHREC rank 17061. Act of Treason, then scry 1 — skipped with the rest if
// the target is illegal as it resolves (the ruling).

export default defineCard({
  name: "Portent of Betrayal",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Gain control of target creature until end of turn. Untap that creature. It gains haste until end of turn. Scry 1. (Look at the top card of your library. You may put that card on the bottom.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control", target: 0, untilEndOfTurn: true },
      { kind: "untap", target: 0 },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      { kind: "scry", amount: 1 },
    ],
  },
});
