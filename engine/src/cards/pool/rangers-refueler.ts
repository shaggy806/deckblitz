import { defineCard } from "../define.js";
import { crew, crewText } from "../helpers.js";

const DRAW = "Whenever you activate an exhaust ability, draw a card.";
const EXHAUST = "Exhaust — {4}: This Vehicle becomes an artifact creature. Put a +1/+1 counter on it.";

export default defineCard({
  name: "Rangers' Refueler",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 3,
  toughness: 3,
  text: `${DRAW}\n${EXHAUST} (Activate each exhaust ability only once.)\n${crewText(2)}`,
  triggered: [
    {
      trigger: { on: "activates-ability", who: "you", exhaust: true },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW,
    },
  ],
  activated: [
    {
      cost: { mana: "{4}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "become", target: "source", addTypes: ["artifact", "creature"], duration: "permanent" },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: EXHAUST,
      exhaust: true,
    },
    crew(2, crewText(2)),
  ],
});
