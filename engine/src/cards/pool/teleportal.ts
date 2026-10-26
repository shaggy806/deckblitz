import { defineCard } from "../define.js";

// Return to Ravnica. EDHREC rank 13837.
//
// Rulings:
//   [2017-03-14] The set of creatures that gets +1/+0 from an overloaded Teleportal is determined
//     as the spell resolves. ... the set of creatures that can't be blocked is constantly updated.
//     Any creature you control at the moment blockers are chosen can't be blocked.
//
// Overloaded, the +1/+0 is locked to the creatures there as it resolves
// (`modify-pt-all`), and "can't be blocked" is a `restrict` over a filter for
// the rest of the turn, which reaches creatures you control later too (rule
// 611.2c — the ruling).
export default defineCard({
  name: "Teleportal",
  manaCost: "{U}{R}",
  colors: ["U", "R"],
  types: ["sorcery"],
  text: "Target creature you control gets +1/+0 until end of turn and can't be blocked this turn.\nOverload {3}{U}{R} (You may cast this spell for its overload cost. If you do, change \"target\" in its text to \"each.\")",
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
    ],
  },
  overload: {
    cost: "{3}{U}{R}",
    effect: {
      kind: "sequence",
      effects: [
        {
          kind: "modify-pt-all",
          filter: { type: "creature", controlledBy: "you" },
          power: 1,
          toughness: 0,
          duration: "end-of-turn",
        },
        { kind: "restrict", filter: { type: "creature", controlledBy: "you" }, restrictions: ["cant-be-blocked"] },
      ],
    },
  },
});
