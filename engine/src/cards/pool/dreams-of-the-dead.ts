import { defineCard } from "../define.js";
import { cumulativeUpkeep } from "../helpers.js";

// EDHREC rank 26792. Whip of Erebos's return (the exile-instead is a
// replacement of this resolution, not a granted ability — the ruling: "This
// is a replacement effect"), and the creature gains the cumulative upkeep
// helper's trigger for good, its controller paying {2} per age counter.
//
// Rulings:
//   [2004-10-04] This is a replacement effect.
//   [2008-10-01] If a creature returned to the battlefield with Dreams of the Dead would leave the
//     battlefield for any reason, it's exiled instead — unless the spell or ability that's causing
//     the creature to leave the battlefield is actually trying to exile it!
//   [2013-04-15] If a permanent has multiple instances of cumulative upkeep, each triggers
//     separately. However, the age counters are not connected to any particular ability.

const TEXT =
  '{1}{U}: Return target white or black creature card from your graveyard to the battlefield. That creature gains "Cumulative upkeep {2}." If the creature would leave the battlefield, exile it instead of putting it anywhere else.';

export default defineCard({
  name: "Dreams of the Dead",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${TEXT} (At the beginning of its controller's upkeep, that player puts an age counter on it, then sacrifices it unless they pay its upkeep cost for each age counter on it.)`,
  activated: [
    {
      cost: { mana: "{1}{U}", tap: false },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { type: "creature", anyOf: [{ colors: ["W"] }, { colors: ["B"] }] },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "put-onto-battlefield", target: 0, exileIfItWouldLeave: true },
          { kind: "grant-triggered", target: 0, ability: cumulativeUpkeep("{2}"), duration: "permanent" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
