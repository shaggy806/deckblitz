import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 10344.
//
// Rulings:
//   [2006-07-15] Each creature with at least one of those subtypes gets +2/+2 from Lovisa
//     Coldeyes' ability, regardless of how many of those subtypes it has. For example, a 3/3
//     Mistform Ultimus would become 5/5, not 9/9.
//
// One static over every creature with any of the three subtypes (`subtypes`
// is an OR), so a creature with two of them still gets +2/+2 once.

const TEXT = "Each creature that's a Barbarian, a Warrior, or a Berserker gets +2/+2 and has haste.";

export default defineCard({
  name: "Lovisa Coldeyes",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 3,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtypes: ["Barbarian", "Warrior", "Berserker"] } },
      grantPt: [2, 2],
      grantKeywords: ["haste"],
      text: TEXT,
    },
  ],
});
