import { defineCard } from "../define.js";
import { SIEGE_REMINDER, siege } from "../helpers.js";

// EDHREC rank 18645.
//
// X is read as the target is chosen and again as it resolves (the target's
// power checked against the lands you control then).

const ENTER_TEXT =
  "When this Siege enters, destroy target non-Elf creature an opponent controls with power X or less, where X is the number of lands you control.";

export default defineCard({
  name: "Invasion of Lorwyn",
  manaCost: "{4}{B}{G}",
  colors: ["B", "G"],
  types: ["battle"],
  subtypes: ["Siege"],
  defense: 5,
  text: `${SIEGE_REMINDER}\n${ENTER_TEXT}`,
  triggered: [
    siege(),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "permanent",
          whose: "opponent",
          filter: {
            type: "creature",
            notSubtypes: ["Elf"],
            power: { op: "lte", n: { amount: { countOf: { type: "land", controlledBy: "you" } } } },
          },
        },
      ],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  faces: ["Invasion of Lorwyn", "Winnowing Forces"],
  transform: true,
});
