import { defineCard } from "../define.js";

// EDHREC rank 15656.
//
// Rulings:
//   You may tap any untapped permanents you control with the appropriate creature type
//   (including this creature) to pay the cost of the ability, including creatures that haven't
//   been under your control continuously since the beginning of your most recent turn.

const TEXT = "Tap five untapped Elves you control: Create a 7/7 green Elemental creature token with trample.";

export default defineCard({
  name: "Voice of the Woods",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf"],
  power: 2,
  toughness: 2,
  text: `${TEXT} (It can deal excess combat damage to the player or planeswalker it's attacking.)`,
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 5, filter: { subtype: "Elf", controlledBy: "you" }, includeSelf: true },
      },
      targets: [],
      effect: { kind: "create-token", token: "7/7 Green Elemental Token with Trample", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
