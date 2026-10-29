import { defineCard } from "../define.js";

// EDHREC rank 2156.
// Rulings:
//   [2023-06-16] Galadhrim Ambush counts all attacking creatures no matter which player,
//     planeswalker, or battle they're attacking, including attacking creatures you control if
//     Galadhrim Ambush is cast during your combat phase.
//
// X counts every attacking creature, whoever controls it. The prevention is
// Arachnogenesis's shape: each source matched as its damage would be dealt
// (rule 615.1), so the new Elf Warriors' damage gets through.

export default defineCard({
  name: "Galadhrim Ambush",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Create X 1/1 green Elf Warrior creature tokens, where X is the number of attacking creatures.\nPrevent all combat damage that would be dealt this turn by non-Elf creatures.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Elf Warrior Token", count: { countOf: { type: "creature", attacking: true } } },
      { kind: "prevent-all-combat-damage", by: { type: "creature", notSubtypes: ["Elf"] } },
    ],
  },
});
