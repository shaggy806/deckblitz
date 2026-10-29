import { defineCard } from "../define.js";

// EDHREC rank 23934.
//
// Rulings:
//   [2021-03-19] If the second target creature is no longer on the battlefield as the damage is
//     dealt, the damage isn't redirected away from its original recipient. The same is true if the
//     second target creature isn't a creature (or a planeswalker) at that time.
//   [2021-03-19] The damage dealt to the second target creature is dealt by the original source of
//     damage, not by Kor Chant.
//   [2021-03-19] You choose the two target creatures as you cast Kor Chant, but you choose the
//     source as it resolves.

export default defineCard({
  name: "Kor Chant",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "All damage that would be dealt this turn to target creature you control by a source of your choice is dealt to another target creature instead.",
  targets: ["creature-you-control", { kind: "other", of: "creature" }],
  effect: { kind: "prevent-damage-from-chosen-source", to: 0, amount: "all", redirectTo: 1 },
});
