import { defineCard } from "../define.js";

// EDHREC rank 10870.

export default defineCard({
  name: "Zurgo Helmsmasher",
  manaCost: "{2}{R}{W}{B}",
  colors: ["W", "B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Orc", "Warrior"],
  power: 7,
  toughness: 2,
  keywords: ["haste"],
  text: "Haste\nZurgo attacks each combat if able.\nDuring your turn, Zurgo has indestructible.\nWhenever a creature dealt damage by Zurgo this turn dies, put a +1/+1 counter on Zurgo.",
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["must-attack"],
      text: "Zurgo attacks each combat if able.",
    },
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      grantKeywords: ["indestructible"],
      text: "During your turn, Zurgo has indestructible.",
    },
  ],
  triggered: [
    {
      trigger: {
        on: "dies",
        who: "any",
        filter: { type: "creature", damagedThisTurnBy: { source: "this" } },
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever a creature dealt damage by Zurgo this turn dies, put a +1/+1 counter on Zurgo.",
    },
  ],
});
