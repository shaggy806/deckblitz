import { defineCard } from "../define.js";

// EDHREC rank 2987.
//
// Rulings:
//   [2018-10-05] You can activate Underrealm Lich's last ability even if it's already tapped. It
//     can't be tapped again, but it still gains indestructible.
//   [2018-10-05] Underrealm Lich's first ability applies even if you have fewer than three cards
//     in your library. If you have no cards in your library, you can't lose the game for trying to
//     draw a card from an empty library.
//   [2018-10-05] If an effect instructs you to draw multiple cards, each draw is performed—and
//     replaced by Underrealm Lich's ability—one at a time.
//
// The draw becomes the effect (`would-draw` `instead: { effect }`, rule 614.11): applied though
// the library is empty, each draw of several replaced and answered before the next.

const DRAW_TEXT =
  "If you would draw a card, instead look at the top three cards of your library, then put one into your hand and the rest into your graveyard.";
const LIFE_TEXT = "Pay 4 life: This creature gains indestructible until end of turn. Tap it.";

export default defineCard({
  name: "Underrealm Lich",
  manaCost: "{3}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Zombie", "Elf", "Shaman"],
  power: 4,
  toughness: 3,
  text: `${DRAW_TEXT}\n${LIFE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-draw",
        who: "you",
        instead: {
          effect: {
            kind: "look-and-choose",
            zone: "library",
            count: 3,
            min: 1,
            max: 1,
            destination: "hand",
            leftover: "graveyard",
          },
        },
      },
      text: DRAW_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, payLife: 4 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
          { kind: "tap", target: "source" },
        ],
      },
      resolve: null,
      text: LIFE_TEXT,
    },
  ],
});
