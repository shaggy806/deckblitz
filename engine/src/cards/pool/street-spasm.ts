import { defineCard } from "../define.js";

// EDHREC rank 18346.
//
// Rulings:
//   [2024-01-12] Because a spell with overload doesn't target when its overload cost is paid, it
//     may affect permanents with hexproof or with protection from the appropriate color.
//   [2024-01-12] If you don't pay the overload cost of a spell with overload, that spell will have
//     a single target. If you pay the overload cost, the spell won't have any targets.
//
// Mizzium Mortars' overload shape with Clan Defiance's "creature without flying" filter; the
// overload cost's {X}{X} is the same X counted twice (rule 107.3).

export default defineCard({
  name: "Street Spasm",
  manaCost: "{X}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Street Spasm deals X damage to target creature without flying you don't control.\nOverload {X}{X}{R}{R} (You may cast this spell for its overload cost. If you do, change \"target\" in its text to \"each.\")",
  targets: [{ kind: "permanent", filter: { type: "creature", notKeyword: "flying", controlledBy: "opponent" } }],
  effect: { kind: "damage", amount: "x", target: 0 },
  overload: {
    cost: "{X}{X}{R}{R}",
    effect: {
      kind: "damage-all",
      amount: "x",
      filter: { type: "creature", notKeyword: "flying", controlledBy: "opponent" },
    },
  },
});
