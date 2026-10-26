import { defineCard } from "../define.js";

// Rulings:
//   [2013-06-07] If, after dealing first-strike combat damage, Kithkin Greatheart loses first
//     strike (perhaps because the Giant you controlled was destroyed by first-strike combat
//     damage), it won’t deal regular combat damage.

const TEXT = "As long as you control a Giant, this creature gets +1/+1 and has first strike.";

export default defineCard({
  name: "Kithkin Greatheart",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kithkin", "Soldier"],
  power: 2,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      // "A Giant" counts this creature too, should it become one.
      condition: { kind: "controls", filter: { subtype: "Giant" }, atLeast: 1, countsSelf: true },
      grantPt: [1, 1],
      grantKeywords: ["first-strike"],
      text: TEXT,
    },
  ],
});
