import { ATTACKED_OR_BLOCKED_THIS_COMBAT, crew, crewText } from "../helpers.js";
import { defineCard } from "../define.js";

const TEXT =
  "At end of combat, if this Vehicle attacked or blocked this combat, put a velocity counter on it. Then if it has two or more velocity counters on it, sacrifice it and draw two cards.";

export default defineCard({
  name: "Daredevil Dragster",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 4,
  toughness: 4,
  text: `${TEXT}\n${crewText(2)}`,
  activated: [crew(2)],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end-combat", who: "any" },
      condition: ATTACKED_OR_BLOCKED_THIS_COMBAT,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "velocity", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "source", filter: { counters: { kind: "velocity", compare: { op: "gte", n: 2 } } } },
            then: {
              kind: "sequence",
              effects: [
                { kind: "sacrifice-source" },
                { kind: "draw", amount: 2 },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
