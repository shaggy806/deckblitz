import { defineCard } from "../define.js";

// EDHREC rank 12552.
//
// Rulings:
//   [2023-02-04] Any other effects of that damage, such as life gain from lifelink, still apply.
//   [2023-02-04] Multiple instances of toxic are cumulative. For example, if a creature has toxic
//     2 and gains toxic 1 due to another effect, combat damage that creature deals to a player
//     will cause that player to get 3 poison counters.
//   [2023-02-04] If a creature with toxic deals combat damage to a creature or planeswalker, or if
//     it deals noncombat damage, toxic has no effect and no player gets poison counters.
//   [2023-02-04] Damage dealt by a creature with toxic grants the same number of counters
//     regardless of how much damage is dealt. Notably, if a replacement effect modifies the damage
//     in some way (such as that of Gratuitous Violence), the number of counters given remains
//     unchanged.
//   [2023-02-04] A player with ten or more poison counters loses the game. This is a state-based
//     action and doesn't use the stack. In other words, it happens immediately and players can't
//     respond to it, just like a player losing the game due to having 0 or less life.
//   [2023-02-04] Toxic doesn't change the amount of combat damage a creature deals. For example,
//     if a 2/2 creature with toxic 1 deals combat damage to a player, that creature will deal 2
//     damage. The results of that damage are the player loses 2 life and gets a poison counter.
//   [2023-02-04] Conversely, replacement effects that apply to the number of counters put on a
//     player can modify the counters placed this way. For example, Vorinclex, Monstrous Raider's
//     last two abilities can apply to counters placed this way.

export default defineCard({
  name: "Slaughter Singer",
  manaCost: "{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Cleric"],
  power: 2,
  toughness: 2,
  toxic: 2,
  text: "Toxic 2 (Players dealt combat damage by this creature also get two poison counters.)\nWhenever another creature you control with toxic attacks, it gets +1/+1 until end of turn.",
  triggered: [
    {
      // Toxic read as it attacks (the trigger's filter), printed or granted.
      trigger: { on: "attacks", who: "you-control", filter: { type: "creature", controlledBy: "you", hasToxic: true }, otherOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "trigger-object", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever another creature you control with toxic attacks, it gets +1/+1 until end of turn.",
    },
  ],
});
