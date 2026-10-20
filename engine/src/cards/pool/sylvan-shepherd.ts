import { defineCard } from "../define.js";

// EDHREC rank 19434. A d20 results table (rule 706.3a).

const TEXT =
  "Whenever this creature attacks, roll a d20.\n1—9 | You gain 1 life.\n10—19 | You gain 2 life.\n20 | You gain 5 life.";

export default defineCard({
  name: "Sylvan Shepherd",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 2,
  toughness: 3,
  keywords: ["vigilance"],
  text: `Vigilance\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "roll-dice",
        sides: 20,
        table: [
          { min: 1, max: 9, effect: { kind: "gain-life", amount: 1 } },
          { min: 10, max: 19, effect: { kind: "gain-life", amount: 2 } },
          { min: 20, effect: { kind: "gain-life", amount: 5 } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
