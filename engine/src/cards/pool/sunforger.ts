import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// Rulings:
//   If you cast a spell "without paying its mana cost," you can't choose to cast it for any
//     alternative costs. You can, however, pay additional costs. If the card has any mandatory
//     additional costs, those must be paid to cast the spell.
//   You can't pay the cost of unattaching Sunforger unless Sunforger is attached to a creature.
//   If a spell has {X} in its mana cost, you must choose 0 as the value of X when casting it without
//     paying its mana cost.
//
// "Cast that card" is no "you may", but the search is for a stated quality, so
// a player who'd rather not cast it can simply not find it (rule 701.23b): the
// `cast-now`'s decline ends the same way, the card in the library to be
// shuffled.

const TEXT =
  "{R}{W}, Unattach this Equipment: Search your library for a red or white instant card with mana value 4 or less and cast that card without paying its mana cost. Then shuffle.";

export default defineCard({
  name: "Sunforger",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature gets +4/+0.\n${TEXT}\nEquip {3}`,
  static: [{ affects: { scope: "attached" }, grantPt: [4, 0], text: "Equipped creature gets +4/+0." }],
  activated: [
    {
      cost: { mana: "{R}{W}", tap: false, unattach: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: {
          type: "instant",
          anyOf: [{ colors: ["R"] }, { colors: ["W"] }],
          manaValue: { op: "lte", n: 4 },
        },
        destination: "stay",
        min: 0,
        max: 1,
        then: { kind: "cast-now", target: 0, free: true },
      },
      resolve: null,
      text: TEXT,
    },
    equip("{3}"),
  ],
});
