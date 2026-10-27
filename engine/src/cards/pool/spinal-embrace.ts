import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 17104.
//
// Rulings:
//   [2022-12-08] You must sacrifice the creature if you still control it as the delayed triggered
//     ability resolves.
//
// Slave of Bolas's shape. "A creature you don't control" is one an opponent
// controls. The control change has no duration; `sacrifice-target` sacrifices
// only while you still control it (rule 701.21a), and "if you do" reads that
// sacrifice (`this-way: sacrificed`), with its toughness as it last existed.
export default defineCard({
  name: "Spinal Embrace",
  manaCost: "{3}{U}{U}{B}",
  colors: ["U", "B"],
  types: ["instant"],
  text: "Cast this spell only during combat.\nUntap target creature you don't control and gain control of it. It gains haste until end of turn. At the beginning of the next end step, sacrifice it. If you do, you gain life equal to its toughness.",
  castOnlyIf: { kind: "turn-structure", duringCombat: true },
  targets: ["creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "untap", target: 0 },
      { kind: "gain-control", target: 0, untilEndOfTurn: false },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      {
        kind: "delayed-trigger",
        at: "next-end-step",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "sacrifice-target", target: 0 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "sacrificed", who: "you" },
              then: { kind: "gain-life", amount: { toughnessOf: 0 } },
            },
          ],
        },
        text: "Sacrifice the creature Spinal Embrace gained control of. If you do, you gain life equal to its toughness.",
      },
    ],
  },
});
