import { defineCard } from "../define.js";

// EDHREC rank 29069.
//
// Rulings:
//   [2005-10-01] Multiple Ghosts of the Innocent effects are cumulative, and each will halve the
//     damage, rounded down. For example, with three on the battlefield, 14 damage becomes 7, then
//     3, then finally 1, and only 1 damage would actually be dealt.
//   [2005-10-01] If both Ghosts of the Innocent and Furnace of Rath (which doubles damage) are on
//     the battlefield, the controller of the permanent being dealt damage or the player being
//     dealt damage can apply the effects in either order. This can matter if the original amount
//     of damage is odd. For example, if a source would deal 3 damage, Ghosts of the Innocent would
//     make it 1 damage, then Furnace of Rath would make it 2 damage, if the player chose to apply
//     the effects in that order.
//   [2005-10-01] Half of 1 rounded down is 0. A source that would deal 1 damage won’t deal damage
//     at all.
//   [2005-10-01] This isn’t a damage prevention effect. If Excruciator (“Damage that would be
//     dealt by Excruciator can’t be prevented”) would deal 7 damage to a permanent or player, it
//     deals 3 damage instead.
//   [2005-10-01] If a damage prevention effect and Ghosts of the Innocent’s effect would apply to
//     the same damage, the player or the controller of the creature being dealt damage may apply
//     the effects in either order (most likely applying the halving effect first).
//   [2005-10-01] If damage is redirected, it’s only halved once.

export default defineCard({
  name: "Ghosts of the Innocent",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 4,
  toughness: 5,
  text: "If a source would deal damage to a permanent or player, it deals half that damage, rounded down, to that permanent or player instead.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", halve: "down" },
      text: "If a source would deal damage to a permanent or player, it deals half that damage, rounded down, to that permanent or player instead.",
    },
  ],
});
