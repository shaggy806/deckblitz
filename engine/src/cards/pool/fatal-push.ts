import { defineCard } from "../define.js";
import { REVOLT_CONDITION } from "../helpers.js";

// EDHREC rank 2979.
//
// Rulings:
//   [2020-08-07] Tokens that leave the battlefield will satisfy a revolt ability.
//   [2020-08-07] If a creature on the battlefield has {X} in its mana cost, X is considered to be
//     0.
//   [2020-08-07] Revolt abilities don't care why the permanent left the battlefield, who caused it
//     to move, or where it moved to. They're equally satisfied by an artifact you sacrificed to
//     pay a cost, a creature you controlled that was destroyed by Cast Down, or an enchantment you
//     returned to your hand with Cyclonic Rift.
//   [2020-08-07] Fatal Push can target any creature, even one with mana value 5 or greater. The
//     creature's mana value is checked only as Fatal Push resolves.
// Any creature is a legal target; its mana value, and revolt, are read only
// as Fatal Push resolves (the ruling): 2 or less, or 4 or less with revolt.

export default defineCard({
  name: "Fatal Push",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text:
    "Destroy target creature if it has mana value 2 or less.\n" +
    "Revolt — Destroy that creature if it has mana value 4 or less instead if a permanent left the battlefield under your control this turn.",
  targets: ["creature"],
  effect: {
    kind: "conditional",
    condition: {
      kind: "any",
      of: [
        { kind: "target", index: 0, filter: { manaValue: { op: "lte", n: 2 } } },
        {
          kind: "all",
          of: [REVOLT_CONDITION, { kind: "target", index: 0, filter: { manaValue: { op: "lte", n: 4 } } }],
        },
      ],
    },
    then: { kind: "destroy", target: 0 },
  },
});
