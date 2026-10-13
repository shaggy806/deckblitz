import { defineCard } from "../define.js";

// EDHREC rank 6959.
//
// Rulings:
//   [2016-01-22] The “legend rule” checks the full names of legendary permanents. You can control
//     Oath of Gideon and Oath of Chandra at the same time, for example.
//   [2016-01-22] Even if you control a particular Oath, you can cast another of that Oath to take
//     advantage of its enters-the-battlefield ability. It will enter the battlefield, causing its
//     first ability to trigger. You will then choose one to keep, as detailed above, and then its
//     enters-the-battlefield ability will resolve.
//   [2016-01-22] Each of the Oaths is legendary: if you control more than one of any particular
//     Oath, you choose one to remain on the battlefield and the others are put into your
//     graveyard.
//
// Growing Rites of Itlimoc's look, and Vizier of the Menagerie's spend
// permission narrowed to planeswalker spells (`spendManaAs` — Chromatic
// Orrery's "as though it were mana of any color").
const ENTER_TEXT =
  "When Oath of Nissa enters, look at the top three cards of your library. You may reveal a creature, land, or planeswalker card from among them and put it into your hand. Put the rest on the bottom of your library in any order.";
const SPEND_TEXT = "You may spend mana as though it were mana of any color to cast planeswalker spells.";

export default defineCard({
  name: "Oath of Nissa",
  manaCost: "{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${SPEND_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 3,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { typesAnyOf: ["creature", "land", "planeswalker"] },
        destination: "hand",
        leftover: "bottom-any-order",
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      spendManaAs: { as: "any-color", spell: { type: "planeswalker" } },
      text: SPEND_TEXT,
    },
  ],
});
