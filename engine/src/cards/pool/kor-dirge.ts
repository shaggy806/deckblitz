import { defineCard } from "../define.js";

// EDHREC rank 23480.
//
// Rulings:
//   If the second target creature is no longer on the battlefield as the damage is dealt, the
//   damage isn't redirected away from its original recipient.
//   You choose the two target creatures as you cast Kor Dirge, but you choose the source as it
//   resolves.
//   The damage dealt to the second target creature is dealt by the original source of damage,
//   not by Kor Dirge.
//
// - Kor Chant's black twin: a chosen-source rule for all of that source's
//   damage this turn, redirected to the second target — "another" than the
//   first (rule 115.3).
export default defineCard({
  name: "Kor Dirge",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "All damage that would be dealt this turn to target creature you control by a source of your choice is dealt to another target creature instead.",
  targets: ["creature-you-control", { kind: "other", of: "creature", than: { slot: 0 } }],
  effect: { kind: "prevent-damage-from-chosen-source", to: 0, amount: "all", redirectTo: 1 },
});
