import { defineCard } from "../define.js";

export default defineCard({
  name: "Tentative Connection",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text:
    "This spell costs {3} less to cast if you control a creature with menace.\n" +
    "Gain control of target creature until end of turn. Untap that creature. It gains haste until end of turn.",
  selfCostReduction: {
    condition: { kind: "controls", filter: { type: "creature", keyword: "menace" }, atLeast: 1 },
    reduceGeneric: 3,
  },
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control", target: 0, untilEndOfTurn: true },
      { kind: "untap", target: 0 },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
    ],
  },
});
