import { defineCard } from "../define.js";

// EDHREC rank 27129.
//
// Rulings:
//   [2023-09-01] In rare cases, a spell or ability might attempt to create a Role token enchanting
//     a permanent that it can’t legally enchant (because of an ability like protection from
//     enchantments). In such cases, the Role token isn’t created.
//   [2023-09-01] A permanent can have multiple Roles attached to it if each one is controlled by a
//     different player.
//   [2023-09-01] If you don't choose a target for Protective Parents's ability, the Young Hero
//     Role token won't be created.
//   [2023-09-01] If two or more Roles controlled by the same player become attached to a permanent
//     at the same time (perhaps due to an effect such as that of Doubling Season), that player
//     chooses which one to keep and which are put into their owners’ graveyards.
//   [2023-09-01] Hexproof and shroud won’t prevent a Role from becoming attached to a permanent if
//     the ability creating that Role attached to that permanent doesn’t target it.
//   [2023-09-01] If a permanent has more than one Role attached to it controlled by the same
//     player, each of those Roles except the one with the most recent timestamp is put into its
//     owner’s graveyard. This is a state-based action.
//   [2023-09-01] Some spells and abilities that create Role tokens require targets. If each target
//     chosen is an illegal target as that spell or ability tries to resolve, it won’t resolve. The
//     Role token won’t be created.
//   [2023-09-01] Cards in the Wilds of Eldraine main set create six different Role tokens: Cursed,
//     Monster, Royal, Sorcerer, Wicked, and Young Hero. A seventh Role token, Virtuous, is created
//     by Ellivere of the Wild Court, the commander of the “Virtue and Valor” Commander Deck.
//   [2023-09-01] Roles are colorless enchantment tokens. Each one has the Aura and Role subtypes
//     and the enchant creature ability.

export default defineCard({
  name: "Protective Parents",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Peasant"],
  power: 3,
  toughness: 2,
  text: "When this creature dies, create a Young Hero Role token attached to up to one target creature you control. (If you control another Role on it, put that one into the graveyard. Enchanted creature has \"Whenever this creature attacks, if its toughness is 3 or less, put a +1/+1 counter on it.\")",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [{ kind: "optional", of: "creature-you-control" }],
      effect: { kind: "create-token", token: "Young Hero Role Token", count: 1, attachedTo: 0 },
      resolve: null,
      text: "When this creature dies, create a Young Hero Role token attached to up to one target creature you control.",
    },
  ],
});
