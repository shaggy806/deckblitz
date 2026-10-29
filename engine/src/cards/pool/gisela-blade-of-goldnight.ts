import { defineCard } from "../define.js";

// EDHREC rank 1127.
//
// Rulings:
//   [2018-03-16] Gisela doubles damage dealt to opponents and permanents your opponents control
//     from any source, including sources controlled by those opponents.
//   [2018-03-16] If damage dealt by a source you control is being divided or assigned among
//     multiple permanents an opponent controls or among an opponent and one or more permanents
//     they control simultaneously, divide the original amount and double the results. For example,
//     if you attack with a 5/5 creature with trample and your opponent blocks with a 2/2 creature,
//     you can assign 2 damage to the blocker and 3 damage to the defending player. These amounts
//     are then doubled to 4 and 6 damage, respectively. You can't double the damage to 10 first
//     and then assign 2 to the creature and 8 to the player.
//   [2018-03-16] If multiple replacement effects would modify how damage would be dealt, the
//     player being dealt damage (or the controller of the permanent being dealt damage) chooses
//     the order in which to apply those effects.

export default defineCard({
  name: "Gisela, Blade of Goldnight",
  manaCost: "{4}{R}{W}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 5,
  toughness: 5,
  keywords: ["flying", "first-strike"],
  text: "Flying, first strike\nIf a source would deal damage to an opponent or a permanent an opponent controls, that source deals double that damage to that player or permanent instead.\nIf a source would deal damage to you or a permanent you control, prevent half that damage, rounded up.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", to: "opponent-side", multiplier: 2 },
      text: "If a source would deal damage to an opponent or a permanent an opponent controls, that source deals double that damage to that player or permanent instead.",
    },
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", to: "your-side", preventHalf: "up" },
      text: "If a source would deal damage to you or a permanent you control, prevent half that damage, rounded up.",
    },
  ],
});
