import { defineCard } from "../define.js";

// EDHREC rank 21185. Ikoria: Lair of Behemoths.
//
// Rulings:
//   [2020-04-17] Excess damage caused by a spell or ability is similar to how combat damage from a
//     creature with trample is handled. Start with the amount of damage being dealt to the
//     creature and determine what is "lethal." This is the creature's toughness minus the amount
//     of damage that it already has marked on it, but ignoring any replacement or prevention
//     effects that will modify this damage. Also ignore whether the creature has an ability such
//     as indestructible that will result in it not being destroyed by this damage.
//   [2020-04-17] Once you've determined how much damage is excess, Flame Spill simultaneously
//     deals damage to the creature and to its controller. This damage may be modified by
//     replacement or prevention effects.
//   [2020-04-17] If the target creature is an illegal target by the time Flame Spill tries to
//     resolve, the spell won't resolve. It won't deal damage to any player.

// Pigment Storm's shape.
export default defineCard({
  name: "Flame Spill",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Flame Spill deals 4 damage to target creature. Excess damage is dealt to that creature's controller instead.",
  targets: ["creature"],
  effect: { kind: "damage", amount: 4, target: 0, excessToController: {} },
});
