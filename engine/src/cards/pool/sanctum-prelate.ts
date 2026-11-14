import { defineCard } from "../define.js";

// EDHREC rank 9880.
//
// Rulings:
//   For spells with {X} in their mana costs, use the value chosen for X to determine if the
//     spell's mana value is the chosen number. For example, if the chosen number is 4, a
//     noncreature spell with mana cost {X}{R}{R} couldn't be cast with X equal to 2, but it could
//     be cast with X equal to any other number.
//   Effects that increase or reduce the cost to cast a spell don't affect that spell's mana value.
//
// "Choose a number" has no upper bound: any number, 0 or more (rule 107.1c),
// asked as a number (`chooseNumberOnEnter`) and read back by the prohibition's
// `chosenNumber` amount. An X spell is offered X by X (rule 202.3e).

const CHOOSE_TEXT = "As this creature enters, choose a number.";
const PROHIBIT_TEXT = "Noncreature spells with mana value equal to the chosen number can't be cast.";

export default defineCard({
  name: "Sanctum Prelate",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 2,
  text: `${CHOOSE_TEXT}\n${PROHIBIT_TEXT}`,
  chooseNumberOnEnter: true,
  static: [
    {
      affects: { scope: "self" },
      prohibits: [
        {
          act: "cast",
          who: "each-player",
          filter: { notTypes: ["creature"], manaValue: { op: "eq", n: { amount: { chosenNumber: true } } } },
        },
      ],
      text: PROHIBIT_TEXT,
    },
  ],
});
