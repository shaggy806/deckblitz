import { defineCard } from "../define.js";

// EDHREC rank 29378. The creature with shadow is chosen as the ability resolves
// (rule 609.7a), and the shield is checked again when the damage would be dealt.
//
// Rulings:
//   [2004-10-04] It can be used on non-combat damage which happens to come from creatures with the
//     Shadow ability.

const TEXT = "{1}: The next time a creature of your choice with shadow would deal damage to you this turn, prevent that damage.";

export default defineCard({
  name: "Circle of Protection: Shadow",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: {
        kind: "prevent-damage-from-chosen-source",
        filter: { type: "creature", keyword: "shadow" },
        to: "you",
        amount: "next-time",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
