import { defineCard } from "../define.js";

const TEXT =
  "Whenever a creature dealt damage by this creature this turn dies, return it to the battlefield under your control. That creature is a black Zombie in addition to its other colors and types.";

export default defineCard({
  name: "Dread Slaver",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Horror"],
  power: 3,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", damagedThisTurnBy: { source: "this" } } },
      targets: [],
      effect: {
        kind: "put-onto-battlefield",
        target: "trigger-object",
        underYourControl: true,
        enterAs: { addColors: ["B"], addSubtypes: ["Zombie"] },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
