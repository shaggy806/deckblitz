import { defineCard } from "../define.js";

// EDHREC rank 811.
//
// Rulings:
//   [2023-04-14] If you cast a card “without paying its mana cost,” you can’t pay any alternative
//     costs. You can, however, pay additional costs. If the card has any mandatory additional
//     costs, those must be paid to cast the card.
//   [2023-04-14] If an exiled card has {X} in its mana cost, you must choose 0 as the value of X
//     when casting it without paying its mana cost.
//   [2023-04-14] Any cards not cast, including land cards, remain in exile. They can’t be cast on
//     later turns.
//   [2023-04-14] Losing the game because a player (preferably an opponent) has ten or more poison
//     counters is a rule of the game. Etali, Primal Sickness doesn’t have to still be on the
//     battlefield when someone (preferably an opponent) gets their tenth poison counter.
//   [2023-04-14] In a multiplayer game, if a player leaves the game, all cards that player owns
//     leave as well. If you leave the game, any spells or permanents you control from Etali’s
//     ability are exiled.
//   [2023-04-14] If you cast more than one of the exiled cards, you choose the order in which to
//     cast them. A spell you cast this way can be the target of a later spell you cast this way.
//     However, permanent spells cast this way won’t resolve until you’re done casting spells, so
//     the permanents they become can’t be the target of spells cast this way. For example, if you
//     exile Twincast and Lightning Strike, you can cast Lightning Strike and then cast Twincast
//     targeting it; but if you exile a creature card and an Aura card, you can’t cast that Aura
//     targeting that creature.
//   [2023-04-14] If you cast any of the exiled cards, you do so as part of the resolution of the
//     triggered ability. You can’t wait to cast them later in the turn. Timing restrictions based
//     on a card’s type are ignored.

export default defineCard({
  name: "Etali, Primal Conqueror",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elder", "Dinosaur"],
  power: 7,
  toughness: 7,
  keywords: ["trample"],
  text: "Trample\nWhen Etali enters, each player exiles cards from the top of their library until they exile a nonland card. You may cast any number of spells from among the nonland cards exiled this way without paying their mana costs.\n{9}{G/P}: Transform Etali. Activate only as a sorcery.",
  activated: [
    {
      cost: { mana: "{9}{G/P}", tap: false },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "{9}{G/P}: Transform Etali. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      // Each player, from the active player in turn order, their own library.
      // Then any number of the nonland ones, one at a time in the order you
      // choose, each cast as this resolves — opponents' cards too, timing
      // ignored, X 0 (the rulings). The rest stay in exile for good.
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "for-each-player",
            who: "each-player",
            effect: { kind: "reveal-until", whose: "that-player", filter: { notTypes: ["land"] }, exile: true, rest: "stay" },
          },
          { kind: "cast-now", from: "exiled-this-way", repeat: true, free: true },
        ],
      },
      resolve: null,
      text: "When Etali enters, each player exiles cards from the top of their library until they exile a nonland card. You may cast any number of spells from among the nonland cards exiled this way without paying their mana costs.",
    },
  ],
  faces: ["Etali, Primal Conqueror", "Etali, Primal Sickness"],
  transform: true,
});
