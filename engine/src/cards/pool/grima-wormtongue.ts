import { defineCard } from "../define.js";

// EDHREC rank 9258.
// Makes Orc Army by amassing → the engine's "Army Token".
//
// Rulings:
//   [2023-06-16] To amass Orcs N, if you don't control an Army creature, create a 0/0 black Orc
//     Army creature token. Then you choose an Army creature you control and put N +1/+1 counters
//     on it. If that Army isn't already an Orc, it becomes an Orc in addition to its other types.
//   [2023-06-16] In the rare case that you control multiple Army creatures (perhaps because you
//     played a creature with changeling) while you amass Orcs, you choose which of your Army
//     creatures to put the +1/+1 counters on. If that creature isn't an Orc, it becomes an Orc in
//     addition to its other types.
//   [2023-06-16] If you don't control an Army, the Orc Army token you create enters the
//     battlefield as a 0/0 creature before receiving counters. Any abilities that trigger when a
//     creature with a certain power enters the battlefield, such as that of Mentor of the Meek,
//     will see the token enter as a 0/0 creature before it gets +1/+1 counters.
//   [2023-06-16] Gríma Wormtongue's activated ability checks whether the sacrificed creature was
//     legendary as it last existed on the battlefield. It doesn't matter whether or not it's
//     legendary in the graveyard.
//   [2023-06-16] Amass abilities are now written as "amass [subtype] N." Previous cards with amass
//     have received errata to say "amass Zombies N."
//   [2023-06-16] If an effect says to set an opponent's life total to a number that's higher than
//     the opponent's current life total while Gríma Wormtongue is on the battlefield, the player's
//     life total doesn't change.
//   [2023-06-16] Spells and abilities that cause opponents to gain life still resolve while Gríma
//     Wormtongue is on the battlefield. No opponent will gain life, but any other effects of that
//     spell or ability will still happen.
//   [2023-06-16] Amass Zombies works the same way, except you create a 0/0 black Zombie Army
//     creature token if you don't control an Army. If the Army creature you chose isn't already a
//     Zombie, it becomes a Zombie in addition to its other types. By combining cards with amass
//     Orcs and amass Zombies, you can end up with an Orc Zombie Army.
//   [2023-06-16] Some spells and abilities that amass Orcs may require targets. If each target
//     chosen is an illegal target as that spell or ability tries to resolve, it won't resolve. You
//     won't amass Orcs.
//   [2023-06-16] Some cards refer to the "amassed Army." That means the Army creature you chose to
//     receive counters, even if no counters were placed on it for some reason.

export default defineCard({
  name: "Gríma Wormtongue",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 1,
  toughness: 4,
  text: "Your opponents can't gain life.\n{T}, Sacrifice another creature: Target player loses 1 life. If the sacrificed creature was legendary, amass Orcs 2.",
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "creature-you-control" },
      targets: ["player"],
      // Legendary as it last existed on the battlefield (the ruling).
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, target: 0 },
          {
            kind: "conditional",
            condition: { kind: "sacrificed", filter: { supertype: "legendary" } },
            then: { kind: "amass", amount: 2, creatureType: "Orc" },
          },
        ],
      },
      resolve: null,
      text: "{T}, Sacrifice another creature: Target player loses 1 life. If the sacrificed creature was legendary, amass Orcs 2.",
      otherOnly: true,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-gain-life", who: "opponent", prevent: true },
      text: "Your opponents can't gain life.",
    },
  ],
});
