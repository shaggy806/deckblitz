import { defineCard } from "../define.js";

const MANA_TEXT = "{T}, Remove a component counter from this artifact: Add two mana of different colors.";
const ROLL_TEXT =
  "{T}: Roll a d20.\n1—9 | Put a component counter on this artifact.\n10—20 | Put two component counters on this artifact.";

export default defineCard({
  name: "Component Pouch",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${MANA_TEXT}\n${ROLL_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "component", count: 1 } },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["W", "U", "B", "R", "G"], different: 1 }, amount: 2 },
      resolve: null,
      text: MANA_TEXT,
    },
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "roll-dice",
        sides: 20,
        table: [
          { min: 1, max: 9, effect: { kind: "add-counter", target: "source", counter: "component", amount: 1 } },
          { min: 10, max: 20, effect: { kind: "add-counter", target: "source", counter: "component", amount: 2 } },
        ],
      },
      resolve: null,
      text: ROLL_TEXT,
    },
  ],
});
