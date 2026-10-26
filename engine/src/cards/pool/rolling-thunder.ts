import { defineCard } from "../define.js";

// EDHREC rank 13342.
//
// Rulings:
//   [2004-10-04] If X is 0, you can't choose any targets.
//   [2015-08-25] You choose how many targets Rolling Thunder has and how the damage is divided as
//     you cast the spell. Each target must receive at least 1 damage.
//
// X divided as it's cast, at least 1 to each target (rule 601.2d) — so no more targets than X,
// and none at X = 0 (Rock Slide's shape).

export default defineCard({
  name: "Rolling Thunder",
  manaCost: "{X}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Rolling Thunder deals X damage divided as you choose among any number of targets.",
  targets: [{ kind: "any-number", of: "any-target", max: "x" }],
  divided: { total: 0, slot: 0, x: true },
  effect: { kind: "damage-divided", from: 0 },
});
