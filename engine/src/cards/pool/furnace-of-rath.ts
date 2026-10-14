import { defineCard } from "../define.js";

// EDHREC rank 4634.
//
// Rulings:
//   [2004-10-04] If you have two of these on the battlefield, the damage is multiplied by 4.
//   [2004-10-04] The multiplied damage counts in all ways as if it came from the original source.
//     Furnace of Rath is not the source.
//   [2004-10-04] If a spell or ability damages multiple things, divide up the damage before
//     applying this effect. This means you can’t normally end up with an odd amount of damage on
//     something.
//   [2004-10-04] The trample rules cause damage to be divided before it is doubled.
//   [2005-08-01] If multiple effects modify how damage will be dealt, the player who would be
//     dealt damage or the controller of the creature that would be dealt damage chooses the order
//     to apply the effects. For example, Mending Hands says, “Prevent the next 4 damage that would
//     be dealt to any target this turn.” Suppose a spell would deal 5 damage to a player who has
//     cast Mending Hands targeting themselves. That player can either (a) prevent 4 damage first
//     and then let Furnace of Rath double the remaining 1 damage, taking 2 damage, or (b) double
//     the damage to 10 and then prevent 4 damage, taking 6 damage.

export default defineCard({
  name: "Furnace of Rath",
  manaCost: "{1}{R}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: "If a source would deal damage to a permanent or player, it deals double that damage to that permanent or player instead.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", multiplier: 2 },
      text: "If a source would deal damage to a permanent or player, it deals double that damage to that permanent or player instead.",
    },
  ],
});
