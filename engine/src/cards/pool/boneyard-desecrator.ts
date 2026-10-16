import { defineCard } from "../define.js";

// EDHREC rank 16531.
//
// Rulings:
//   [2024-04-12] A card, spell, or permanent is an outlaw if it has the Assassin, Mercenary,
//     Pirate, Rogue, or Warlock creature type. It doesn’t matter if it has more than one of those
//     creature types; as long as it has at least one, it’s an outlaw.
//   [2024-04-12] If an ability refers to an outlaw or whether a player controls an outlaw, it’s
//     referring only to permanents with one or more of the creature types specified above.
//     Notably, it’s not referring to any spell or card not on the battlefield. However, other
//     abilities may refer to an “outlaw spell” or “outlaw card” in a zone other than the
//     battlefield. Those abilities refer to spells and cards with one or more of the specified
//     creature types.
//   [2024-04-12] Outlaw is not a creature type. If an effect asks you to choose a creature type,
//     you can’t choose outlaw.
//   [2024-04-12] Use the creature types of the sacrificed creature as it last existed on the
//     battlefield to determine whether or not it was an outlaw.

const OUTLAWS = ["Assassin", "Mercenary", "Pirate", "Rogue", "Warlock"];

// Whether an outlaw was sacrificed is read off the sacrificed creature as it
// last existed on the battlefield (the ruling) — the `sacrificed` condition.
export default defineCard({
  name: "Boneyard Desecrator",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Mercenary"],
  power: 3,
  toughness: 4,
  keywords: ["menace"],
  text: "Menace\n{1}{B}, Sacrifice another creature: Put a +1/+1 counter on this creature. If an outlaw was sacrificed this way, create a Treasure token. (Assassins, Mercenaries, Pirates, Rogues, and Warlocks are outlaws.)",
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false, sacrifice: "creature-you-control" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "sacrificed", filter: { subtypes: OUTLAWS } },
            then: { kind: "create-token", token: "Treasure Token", count: 1 },
          },
        ],
      },
      resolve: null,
      text: "{1}{B}, Sacrifice another creature: Put a +1/+1 counter on this creature. If an outlaw was sacrificed this way, create a Treasure token.",
      otherOnly: true,
    },
  ],
});
