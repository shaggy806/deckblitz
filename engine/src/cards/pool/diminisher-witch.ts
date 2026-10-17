import { defineCard } from "../define.js";

// EDHREC rank 26799.
//
// Rulings:
//   [2023-09-01] If you copy a bargained spell, the copy is also bargained. If a card or token
//     enters the battlefield as a copy of a permanent that’s already on the battlefield, the new
//     permanent isn’t bargained, even if the original was.
//   [2023-09-01] Bargain means “As an additional cost to cast this spell, you may sacrifice an
//     artifact, enchantment, or token.”
//   [2023-09-01] Hexproof and shroud won’t prevent a Role from becoming attached to a permanent if
//     the ability creating that Role attached to that permanent doesn’t target it.
//   [2023-09-01] If two or more Roles controlled by the same player become attached to a permanent
//     at the same time (perhaps due to an effect such as that of Doubling Season), that player
//     chooses which one to keep and which are put into their owners’ graveyards.
//   [2023-09-01] Cards in the Wilds of Eldraine main set create six different Role tokens: Cursed,
//     Monster, Royal, Sorcerer, Wicked, and Young Hero. A seventh Role token, Virtuous, is created
//     by Ellivere of the Wild Court, the commander of the “Virtue and Valor” Commander Deck.
//   [2023-09-01] Some spells and abilities that create Role tokens require targets. If each target
//     chosen is an illegal target as that spell or ability tries to resolve, it won’t resolve. The
//     Role token won’t be created.
//   [2023-09-01] Some instant and sorcery spells require additional targets if they’re bargained.
//     You ignore those targeting requirements if those spells aren’t bargained, and you can’t
//     bargain those spells unless you can choose the appropriate targets. On the other hand, you
//     can bargain a permanent spell even if you won’t be able to choose targets for an
//     enters-the-battlefield ability of that permanent once the spell resolves.
//   [2023-09-01] Bargain represents an optional additional cost. A spell cast with that additional
//     cost paid is “bargained.”
//   [2023-09-01] A permanent can have multiple Roles attached to it if each one is controlled by a
//     different player.
//   [2023-09-01] In rare cases, a spell or ability might attempt to create a Role token enchanting
//     a permanent that it can’t legally enchant (because of an ability like protection from
//     enchantments). In such cases, the Role token isn’t created.
//   [2023-09-01] Roles are colorless enchantment tokens. Each one has the Aura and Role subtypes
//     and the enchant creature ability.
//   [2023-09-01] If a permanent has more than one Role attached to it controlled by the same
//     player, each of those Roles except the one with the most recent timestamp is put into its
//     owner’s graveyard. This is a state-based action.
//   [2023-09-01] You may sacrifice only one artifact, enchantment, or token to pay a spell’s
//     bargain cost.

export default defineCard({
  name: "Diminisher Witch",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 3,
  toughness: 2,
  kicker: { cost: "", keyword: "bargain" },
  text: "Bargain (You may sacrifice an artifact, enchantment, or token as you cast this spell.)\nWhen this creature enters, if it was bargained, create a Cursed Role token attached to target creature an opponent controls. (If you control another Role on it, put that one into the graveyard. Enchanted creature is 1/1.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "create-token", token: "Cursed Role Token", count: 1, attachedTo: 0 },
      resolve: null,
      text: "When this creature enters, if it was bargained, create a Cursed Role token attached to target creature an opponent controls.",
      condition: { kind: "self-kicked" },
    },
  ],
});
