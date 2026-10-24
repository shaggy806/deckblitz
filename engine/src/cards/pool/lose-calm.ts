import { defineCard } from "../define.js";

// EDHREC rank 22689. Act of Treason's shape, plus menace.
export default defineCard({
  name: "Lose Calm",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Gain control of target creature until end of turn. Untap that creature. It gains haste and menace until end of turn. (A creature with menace can't be blocked except by two or more creatures.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control", target: 0, untilEndOfTurn: true },
      { kind: "untap", target: 0 },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "menace", duration: "end-of-turn" },
    ],
  },
});
