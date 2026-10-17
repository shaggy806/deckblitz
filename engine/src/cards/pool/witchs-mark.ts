import { defineCard } from "../define.js";

// EDHREC rank 4243.
//
// Rulings:
//   [2023-09-01] If two or more Roles controlled by the same player become attached to a permanent
//     at the same time (perhaps due to an effect such as that of Doubling Season), that player
//     chooses which one to keep and which are put into their owners' graveyards.
//   [2023-09-01] Some spells and abilities that create Role tokens require targets. If each target
//     chosen is an illegal target as that spell or ability tries to resolve, it won't resolve. The
//     Role token won't be created.
//   [2023-09-01] Cards in the Wilds of Eldraine main set create six different Role tokens: Cursed,
//     Monster, Royal, Sorcerer, Wicked, and Young Hero. A seventh Role token, Virtuous, is created
//     by Ellivere of the Wild Court, the commander of the "Virtue and Valor" Commander Deck.
//   [2023-09-01] In rare cases, a spell or ability might attempt to create a Role token enchanting
//     a permanent that it can't legally enchant (because of an ability like protection from
//     enchantments). In such cases, the Role token isn't created.
//   [2023-09-01] Roles are colorless enchantment tokens. Each one has the Aura and Role subtypes
//     and the enchant creature ability.
//   [2023-09-01] If a permanent has more than one Role attached to it controlled by the same
//     player, each of those Roles except the one with the most recent timestamp is put into its
//     owner's graveyard. This is a state-based action.
//   [2023-09-01] A permanent can have multiple Roles attached to it if each one is controlled by a
//     different player.
//   [2023-09-01] Hexproof and shroud won't prevent a Role from becoming attached to a permanent if
//     the ability creating that Role attached to that permanent doesn't target it.
//   [2023-09-01] You can cast Witch's Mark without a target just to discard a card and draw two
//     cards. However, if you do choose a target, and that target is illegal at the time Witch's
//     Mark tries to resolve, the spell won't resolve and none of its effects will happen. You
//     won't discard, draw, or create a Wicked Role token.
//   [2023-09-01] If you don't choose a target for Witch's Mark, the Wicked Role token won't be
//     created.

export default defineCard({
  name: "Witch's Mark",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "You may discard a card. If you do, draw two cards.\nCreate a Wicked Role token attached to up to one target creature you control. (If you control another Role on it, put that one into the graveyard. Enchanted creature gets +1/+1. When this token is put into a graveyard, each opponent loses 1 life.)",
  targets: [{ kind: "optional", of: "creature-you-control" }],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "may",
        prompt: "Discard a card to draw two cards?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded" },
              then: { kind: "draw", amount: 2 },
            },
          ],
        },
      },
      { kind: "create-token", token: "Wicked Role Token", count: 1, attachedTo: 0 },
    ],
  },
});
