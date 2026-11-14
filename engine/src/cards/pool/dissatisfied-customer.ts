import { defineCard } from "../define.js";

// A result modified to 0 or less loses no life (the ruling).
const ENTERS_TEXT = "When this creature enters, roll a six-sided die. If the result is 3 or less, you lose that much life.";

export default defineCard({
  name: "Dissatisfied Customer",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Guest"],
  power: 2,
  toughness: 1,
  keywords: ["flying", "haste"],
  text: `Flying, haste\n${ENTERS_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "roll-dice",
        sides: 6,
        then: {
          kind: "conditional",
          condition: {
            kind: "all",
            of: [
              { kind: "amounts", left: { roll: "total" }, op: "lte", right: 3 },
              { kind: "amounts", left: { roll: "total" }, op: "gte", right: 1 },
            ],
          },
          then: { kind: "lose-life", who: "you", amount: { roll: "total" } },
        },
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
