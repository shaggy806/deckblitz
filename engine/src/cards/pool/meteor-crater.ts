import { defineCard } from "../define.js";

// EDHREC rank 7028.
//
// Rulings:
//   [2004-10-04] You can’t choose “colorless”. You have to choose one of the five colors.

const TEXT = "{T}: Choose a color of a permanent you control. Add one mana of that color.";

export default defineCard({
  name: "Meteor Crater",
  colors: [],
  types: ["land"],
  text: TEXT,
  // Mox Amber's `colorAmong`: one of the colours among permanents you
  // control, read as the mana is made — never colourless (the ruling), so
  // with no coloured permanent it makes nothing.
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { colorAmong: { controlledBy: "you" } }, amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
