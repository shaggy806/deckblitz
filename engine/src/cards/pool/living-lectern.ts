import { defineCard } from "../define.js";

// EDHREC rank 24062.
//
// Rulings:
//   [2023-09-01] Roles are colorless enchantment tokens. Each one has the Aura and Role subtypes
//     and the enchant creature ability.
//   [2023-09-01] Some spells and abilities that create Role tokens require targets. If each target
//     chosen is an illegal target as that spell or ability tries to resolve, it won’t resolve. The
//     Role token won’t be created.
//   [2023-09-01] You can activate Living Lectern's ability without a target just to draw a card.
//     However, if you do choose a target, and that target is illegal at the time the ability tries
//     to resolve, the ability won't resolve and none of its effects will happen. You won't draw a
//     card.
//   [2023-09-01] In rare cases, a spell or ability might attempt to create a Role token enchanting
//     a permanent that it can’t legally enchant (because of an ability like protection from
//     enchantments). In such cases, the Role token isn’t created.
//   [2023-09-01] If a permanent has more than one Role attached to it controlled by the same
//     player, each of those Roles except the one with the most recent timestamp is put into its
//     owner’s graveyard. This is a state-based action.
//   [2023-09-01] If you don't choose a target creature, the Sorcerer Role token won't be created.
//   [2023-09-01] If two or more Roles controlled by the same player become attached to a permanent
//     at the same time (perhaps due to an effect such as that of Doubling Season), that player
//     chooses which one to keep and which are put into their owners’ graveyards.
//   [2023-09-01] Hexproof and shroud won’t prevent a Role from becoming attached to a permanent if
//     the ability creating that Role attached to that permanent doesn’t target it.
//   [2023-09-01] Cards in the Wilds of Eldraine main set create six different Role tokens: Cursed,
//     Monster, Royal, Sorcerer, Wicked, and Young Hero. A seventh Role token, Virtuous, is created
//     by Ellivere of the Wild Court, the commander of the “Virtue and Valor” Commander Deck.
//   [2023-09-01] A permanent can have multiple Roles attached to it if each one is controlled by a
//     different player.

export default defineCard({
  name: "Living Lectern",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 0,
  toughness: 4,
  text: "{1}, Sacrifice this creature: Draw a card. Create a Sorcerer Role token attached to up to one other target creature you control. Activate only as a sorcery. (If you control another Role on it, put that one into the graveyard. Enchanted creature gets +1/+1 and has \"Whenever this creature attacks, scry 1.\")",
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: "self" },
      targets: [{ kind: "optional", of: { kind: "other", of: "creature-you-control" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "create-token", token: "Sorcerer Role Token", count: 1, attachedTo: 0 },
        ],
      },
      resolve: null,
      text: "{1}, Sacrifice this creature: Draw a card. Create a Sorcerer Role token attached to up to one other target creature you control. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
});
