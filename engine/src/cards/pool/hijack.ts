import { defineCard } from "../define.js";

// Kaladesh (KLD). EDHREC rank 9619.
export default defineCard({
  name: "Hijack",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Gain control of target artifact or creature until end of turn. Untap it. It gains haste until end of turn.",
  targets: ["artifact-or-creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control", target: 0, untilEndOfTurn: true },
      { kind: "untap", target: 0 },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
    ],
  },
});
