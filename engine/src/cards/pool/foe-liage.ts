import { defineCard } from "../define.js";

// EDHREC rank 25873. Any land, anyone's, entering during its controller's turn.
const LANDFALL = "Whenever a land enters during your turn, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Foe-liage",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Plant", "Mutant"],
  power: 3,
  toughness: 3,
  text: LANDFALL,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "land" } },
      whileCondition: { kind: "your-turn" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: LANDFALL,
    },
  ],
});
