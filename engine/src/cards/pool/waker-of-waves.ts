import { defineCard } from "../define.js";

// Rulings:
//   [2020-06-23] You can activate the last ability of Waker of Waves only if it's in your hand.

export default defineCard({
  name: "Waker of Waves",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Whale"],
  power: 7,
  toughness: 7,
  text: "Creatures your opponents control get -1/-0.\n{1}{U}, Discard this card: Look at the top two cards of your library. Put one of them into your hand and the other into your graveyard.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "opponent" } },
      grantPt: [-1, 0],
      text: "Creatures your opponents control get -1/-0.",
    },
  ],
  activated: [
    {
      // `zone: "hand"`: discarding this card is the cost's implicit part.
      cost: { mana: "{1}{U}", tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 2,
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "graveyard",
      },
      resolve: null,
      text: "{1}{U}, Discard this card: Look at the top two cards of your library. Put one of them into your hand and the other into your graveyard.",
      zone: "hand",
    },
  ],
});
