import { defineCard } from "../define.js";

// EDHREC rank 30506.

export default defineCard({
  name: "Sulfur Elemental",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 2,
  keywords: ["flash"],
  splitSecond: true,
  text: "Flash\nSplit second (As long as this spell is on the stack, players can't cast spells or activate abilities that aren't mana abilities.)\nWhite creatures get +1/-1.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["W"] } },
      grantPt: [1, -1],
      text: "White creatures get +1/-1.",
    },
  ],
});
