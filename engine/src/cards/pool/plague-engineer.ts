import { defineCard } from "../define.js";

// EDHREC rank 16006.
//
// Rulings:
//   [2019-06-14] You must choose an existing creature type, such as Sliver or Warrior.
//   [2019-06-14] The choice of creature type is made as Plague Engineer enters the battlefield.
//     Players can't respond to this choice. The -1/-1 effect starts applying immediately.

export default defineCard({
  name: "Plague Engineer",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Carrier"],
  power: 2,
  toughness: 2,
  keywords: ["deathtouch"],
  chooseCreatureTypeOnEnter: true,
  text: "Deathtouch\nAs this creature enters, choose a creature type.\nCreatures of the chosen type your opponents control get -1/-1.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "opponent", ofChosenType: true } },
      grantPt: [-1, -1],
      text: "Creatures of the chosen type your opponents control get -1/-1.",
    },
  ],
});
