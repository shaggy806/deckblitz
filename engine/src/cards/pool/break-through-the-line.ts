import { defineCard } from "../define.js";

// EDHREC rank 11404.
//
// Rulings:
//   [2014-11-24] If the creature’s power is greater than 2 as the activated ability tries to
//     resolve, the ability won’t resolve and none of its effects will happen. However, if the
//     creature’s power is raised above 2 after the ability resolves, it will still have haste and
//     can’t be blocked that turn.

export default defineCard({
  name: "Break Through the Line",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: "{R}: Target creature with power 2 or less gains haste until end of turn and can't be blocked this turn.",
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "lte", n: 2 } } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "{R}: Target creature with power 2 or less gains haste until end of turn and can't be blocked this turn.",
    },
  ],
});
