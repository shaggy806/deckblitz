import { defineCard } from "../define.js";

// EDHREC rank 8441.
//
// Rulings:
//   You can tap any untapped creatures you control, even ones you haven't
//     controlled continuously since your most recent turn began.
//   The two creatures needn't share a creature type, but the card put must
//     share one with each of them: an Elf Wizard and a Human Warrior let you
//     put an Elf Warrior.
//
// "Each creature tapped this way" is the cost's tapped set read type by type
// (`{ typesOf, each }`): a tapped creature with no creature type shares none
// with anything, so then no card qualifies (rule 205.3m).

const TEXT =
  "Tap two untapped creatures you control: You may put a creature card from your hand that shares a creature type with each creature tapped this way onto the battlefield.";

export default defineCard({
  name: "Cryptic Gateway",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 2, filter: { type: "creature", controlledBy: "you" }, includeSelf: true },
      },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: { type: "creature", sharesCreatureTypeWith: { typesOf: { paid: "tapped" }, each: true } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
