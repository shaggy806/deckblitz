import { defineCard } from "../define.js";

// EDHREC rank 26731.
//
// Rulings:
//   [2013-01-24] If you cast Chemister's Trick with overload, only creatures you don't control
//     that are on the battlefield when Chemister's Trick resolves are affected. Creatures that
//     come under another player's control later in the turn are not.
//   [2013-01-24] The controller of a creature that attacks if able still chooses which player or
//     planeswalker it attacks.
//
// Overloaded, "attacks this turn if able" binds the creatures there as it
// resolves (`restrict`'s `asItResolves`, rule 611.2c — Suicidal Charge), as the
// -2/-0 does (`modify-pt-all`).
export default defineCard({
  name: "Chemister's Trick",
  manaCost: "{U}{R}",
  colors: ["U", "R"],
  types: ["instant"],
  text: "Target creature you don't control gets -2/-0 until end of turn and attacks this turn if able.\nOverload {3}{U}{R} (You may cast this spell for its overload cost. If you do, change \"target\" in its text to \"each.\")",
  targets: ["creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: -2, toughness: 0, duration: "end-of-turn" },
      { kind: "restrict", target: 0, restrictions: ["must-attack"] },
    ],
  },
  overload: {
    cost: "{3}{U}{R}",
    effect: {
      kind: "sequence",
      effects: [
        {
          kind: "modify-pt-all",
          filter: { type: "creature", controlledBy: "opponent" },
          power: -2,
          toughness: 0,
          duration: "end-of-turn",
        },
        {
          kind: "restrict",
          filter: { type: "creature", controlledBy: "opponent" },
          asItResolves: true,
          restrictions: ["must-attack"],
        },
      ],
    },
  },
});
