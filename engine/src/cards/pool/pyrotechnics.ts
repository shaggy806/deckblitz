import { defineCard } from "../define.js";

// Legends. EDHREC rank 26495.
//
// Rulings:
//   [2014-11-24] If an effect creates a copy of Pyrotechnics, the number of targets and division
//     of damage can't be changed. The effect that creates the copy may allow you to change the
//     targets, however.
//   [2014-11-24] You choose how the damage is divided as you cast the spell, not as it resolves.
//     Each target must be assigned at least 1 damage.
//   [2014-11-24] If some but not all of Pyrotechnics's targets become illegal, you can't change
//     the division of damage. Damage that would have been dealt to illegal targets simply isn't
//     dealt.
//
// Explosive Crystal's shape: the division is chosen as it's cast, at least 1
// to each target (rule 601.2d).
export default defineCard({
  name: "Pyrotechnics",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Pyrotechnics deals 4 damage divided as you choose among any number of targets.",
  targets: [{ kind: "any-number", of: "any-target", max: 4 }],
  divided: { total: 4, slot: 0 },
  effect: { kind: "damage-divided", from: 0 },
});
