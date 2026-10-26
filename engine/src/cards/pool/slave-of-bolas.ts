import { defineCard } from "../define.js";

// EDHREC rank 13729.
//
// Rulings:
//   [2009-05-01] If you don't control the targeted creature when the "at end of turn" ability
//     resolves, it won't be sacrificed. If it's still on the battlefield but under another
//     player's control, the ability won't try to have you sacrifice it again at the end of the
//     turn after that.
//   [2009-05-01] You may target a creature you already control.
//
// The control change has no duration: it lasts until the creature leaves. `sacrifice-target`
// sacrifices only while the effect's controller still controls it (rule 701.21a).
export default defineCard({
  name: "Slave of Bolas",
  manaCost: "{3}{U/R}{B}",
  colors: ["U", "B", "R"],
  types: ["sorcery"],
  text: "Gain control of target creature. Untap that creature. It gains haste until end of turn. Sacrifice it at the beginning of the next end step.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control", target: 0, untilEndOfTurn: false },
      { kind: "untap", target: 0 },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      {
        kind: "delayed-trigger",
        at: "next-end-step",
        effect: { kind: "sacrifice-target", target: 0 },
        text: "Sacrifice the creature Slave of Bolas gained control of.",
      },
    ],
  },
});
