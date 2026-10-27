import { defineCard } from "../define.js";

// EDHREC rank 14628.
//
// Rulings:
//   [2020-11-10] You must choose an existing creature type, such as Human or Warrior. You could
//     even choose Coward, if you dared. Card types such as artifact and supertypes such as
//     legendary can't be chosen.
//   [2020-11-10] The choice of creature type is made as Brass Herald enters the battlefield.
//     Players can't take any actions between the time the choice is made and the time the
//     appropriate creatures begin to get +1/+1.

const CHOOSE = "As this creature enters, choose a creature type.";
const ETB =
  "When this creature enters, reveal the top four cards of your library. Put all creature cards of the chosen type revealed this way into your hand and the rest on the bottom of your library in any order.";
const ANTHEM = "Creatures of the chosen type get +1/+1.";

export default defineCard({
  name: "Brass Herald",
  manaCost: "{6}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 2,
  toughness: 2,
  chooseCreatureTypeOnEnter: true,
  text: `${CHOOSE}\n${ETB}\n${ANTHEM}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        reveal: true,
        min: 4,
        max: 4,
        filter: { type: "creature", ofChosenType: true },
        destination: "hand",
        leftover: "bottom-any-order",
      },
      resolve: null,
      text: ETB,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", ofChosenType: true } },
      grantPt: [1, 1],
      text: ANTHEM,
    },
  ],
});
