import { defineCard } from "../define.js";

// The chosen-source shield (rule 609.7): the unblocked creature is chosen as
// the ability resolves (609.7a) — with none unblocked, nothing happens — and
// the next time it would deal combat damage to you this turn, all but 1 of
// that damage is prevented. One that would prevent none of it (1 damage)
// isn't used up (609.7b).

const TEXT =
  "{1}: The next time an unblocked creature of your choice would deal combat damage to you this turn, prevent all but 1 of that damage.";

export default defineCard({
  name: "Forcefield",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: {
        kind: "prevent-damage-from-chosen-source",
        filter: { type: "creature", unblocked: true },
        to: "you",
        amount: "next-time",
        allBut: 1,
        combatOnly: true,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
