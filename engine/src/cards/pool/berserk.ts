import { defineCard } from "../define.js";

// EDHREC rank 3451.
//
// "Before the combat damage step" is Blood Frenzy's restriction: the steps up
// to and including declare blockers. X is the creature's power as the spell
// resolves (Fatal Frenzy). The delayed trigger destroys it only if it was
// declared an attacker this turn, and whether it's still a creature doesn't
// matter (its ruling).

export default defineCard({
  name: "Berserk",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Cast this spell only before the combat damage step.\nTarget creature gains trample and gets +X/+0 until end of turn, where X is its power. At the beginning of the next end step, destroy that creature if it attacked this turn.",
  castOnlyIf: {
    kind: "turn-structure",
    steps: ["upkeep", "draw", "precombat-main", "begin-combat", "declare-attackers", "declare-blockers"],
  },
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
      { kind: "modify-pt", target: 0, power: { powerOf: 0 }, toughness: 0, duration: "end-of-turn" },
      {
        kind: "delayed-trigger",
        at: "next-end-step",
        effect: {
          kind: "conditional",
          condition: { kind: "target", index: 0, filter: { attackedThisTurn: true } },
          then: { kind: "destroy", target: 0 },
        },
        text: "At the beginning of the next end step, destroy that creature if it attacked this turn.",
      },
    ],
  },
});
