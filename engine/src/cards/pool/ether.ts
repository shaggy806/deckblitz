import { defineCard } from "../define.js";

// EDHREC rank 13756.
// Rulings:
//   [2025-06-06] After Ether's ability resolves, the next instant or sorcery spell you cast that
//     turn will be copied whether or not it has targets and whether or not you spent the mana
//     added by Ether's ability on that spell.
//   [2025-06-06] Ether's ability is a mana ability. It doesn't use the stack and can't be
//     responded to.
//   [2025-06-06] The copy is created on the stack, so it's not "cast." Abilities that trigger
//     when a player casts a spell won't trigger.

const TEXT =
  "{T}, Exile this artifact: Add {U}. When you next cast an instant or sorcery spell this turn, copy that spell. You may choose new targets for the copy.";

export default defineCard({
  name: "Ether",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      // A mana ability (rule 605.1a) with a delayed trigger beside its mana
      // (Magus Lucea Kane's shape): the next instant or sorcery is copied
      // whatever paid for it. Exiling itself keeps it off the auto-payer.
      cost: { mana: null, tap: true, exileSelf: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "U",
        amount: 1,
        also: {
          kind: "delayed-trigger",
          at: { nextSpell: { typesAnyOf: ["instant", "sorcery"] } },
          effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
          text: "Copy that spell. You may choose new targets for the copy.",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
