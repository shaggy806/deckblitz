import { defineCard } from "../define.js";

// "When you lose control of the creature" is a delayed ability that watches
// for any reason: the "until end of turn" ending in the cleanup step, or a
// spell or ability giving another player control (the rulings, rule 603.10d).
export default defineCard({
  name: "Ray of Command",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Untap target creature an opponent controls and gain control of it until end of turn. That creature gains haste until end of turn. When you lose control of the creature, tap it.",
  targets: ["creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "untap", target: 0 },
      { kind: "gain-control", target: 0, untilEndOfTurn: true },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      {
        kind: "delayed-trigger",
        at: { losesControl: 0 },
        effect: { kind: "tap", target: 0 },
        text: "When you lose control of the creature, tap it.",
      },
    ],
  },
});
