import { defineCard } from "../define.js";

// Rulings:
//   All the spells you cast due to the triggered ability are cast during the resolution of that
//     ability. You can cast them in any order.
//   If a spell has {X} in its mana cost, you must choose 0 as the value of X.
//   Cards not cast this way, including any land cards, remain in exile.
//   In a multiplayer game, you choose an opponent to choose a nonland card exiled with Plargg and
//     Nassari.

const TEXT =
  "At the beginning of your upkeep, each player exiles cards from the top of their library until they exile a nonland card. An opponent chooses a nonland card exiled this way. You may cast up to two spells from among the other cards exiled this way without paying their mana costs.";

export default defineCard({
  name: "Plargg and Nassari",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Orc", "Efreet"],
  power: 5,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      // Each player, in turn order, their own library; then an opponent (the
      // controller's pick among several, with the cards in view) chooses one
      // of the nonland cards, which stays in exile; then up to two of the
      // others, cast one at a time as this resolves, free (X is 0). The rest
      // stay in exile for good.
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "for-each-player",
            who: "each-player",
            effect: { kind: "reveal-until", whose: "that-player", filter: { notTypes: ["land"] }, exile: true, rest: "stay" },
          },
          {
            kind: "look-and-choose",
            zone: "exiled-this-way",
            chooser: "an-opponent",
            filter: { notTypes: ["land"] },
            min: 1,
            max: 1,
            destination: "stay",
            leftover: "stay",
            prompt: "Choose a nonland card exiled this way: up to two of the others may be cast free, but not this one",
          },
          { kind: "cast-now", from: "exiled-this-way", exceptChosen: true, repeat: true, upTo: 2, free: true },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
