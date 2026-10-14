import { defineCard } from "../define.js";

// EDHREC rank 3059.
//
// Rulings:
//   [2025-11-17] If a creature you control has a mana ability with {T} in the cost, activating
//     that ability while casting a spell with convoke will result in the creature being tapped
//     before you pay the spell's costs. You won't be able to tap it again for convoke. Similarly,
//     if you sacrifice a creature to activate a mana ability while casting a spell with convoke,
//     that creature won't be on the battlefield when you pay the spell's costs, so you won't be
//     able to tap it for convoke.
//   [2025-11-17] You can tap any untapped creature you control to convoke a spell, even one you
//     haven't controlled continuously since the beginning of your most recent turn.
//   [2025-11-17] The damage is dealt by the same source as the original source of damage. The
//     doubled damage isn't dealt by Collective Inferno unless (in a very unusual case) it was the
//     original source of damage.
//   [2025-11-17] When calculating a spell's total cost, include any alternative costs, additional
//     costs, or anything else that increases or reduces the cost to cast the spell. Convoke
//     applies after the total cost is calculated. Convoke doesn't change a spell's mana cost or
//     mana value.
//   [2025-11-17] If another effect (or effects) modifies how much damage a source you control of
//     the chosen type would deal (for example, by preventing some of that damage), the player
//     being dealt damage or the controller of the permanent being dealt damage chooses the order
//     in which any such effects, including the effect of Collective Inferno's last ability, apply.
//     If all of the damage is prevented before the effect of Collective Inferno's last ability
//     would apply, its effect no longer applies.
//   [2025-11-17] Tapping an untapped creature that's attacking or blocking to convoke a spell
//     won't cause that creature to stop attacking or blocking.
//   [2025-11-17] If damage dealt is being divided or assigned among multiple permanents or
//     players, that damage is divided or assigned before any effects modify how much damage would
//     be dealt. For example, say you control Collective Inferno and you attack an opponent with a
//     5/5 creature of the chosen type with trample and haste. If it's blocked by a 2/2 creature,
//     you can assign 2 damage to the blocker and 3 damage to the defending player. Those amounts
//     are then doubled to 4 and 6, respectively.

export default defineCard({
  name: "Collective Inferno",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  convoke: true,
  chooseCreatureTypeOnEnter: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nAs this enchantment enters, choose a creature type.\nDouble all damage that sources you control of the chosen type would deal.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", multiplier: 2, source: { controlledBy: "you", ofChosenType: true } },
      text: "Double all damage that sources you control of the chosen type would deal.",
    },
  ],
});
