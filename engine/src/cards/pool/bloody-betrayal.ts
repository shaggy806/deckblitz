import { defineCard } from "../define.js";

// EDHREC rank 8361. Involuntary Employment's shape with a Blood token: an
// illegal target means the spell doesn't resolve and makes no Blood (the
// ruling).
export default defineCard({
  name: "Bloody Betrayal",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Gain control of target creature until end of turn. Untap that creature. It gains haste until end of turn. Create a Blood token. (It's an artifact with \"{1}, {T}, Discard a card, Sacrifice this token: Draw a card.\")",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control", target: 0, untilEndOfTurn: true },
      { kind: "untap", target: 0 },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      { kind: "create-token", token: "Blood Token", count: 1 },
    ],
  },
});
