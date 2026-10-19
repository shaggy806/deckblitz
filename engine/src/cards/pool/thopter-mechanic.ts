import { defineCard } from "../define.js";

// EDHREC rank 16747. The Brothers' War.

const DRAW_TEXT = "Whenever you draw your second card each turn, put a +1/+1 counter on this creature.";
const DIES_TEXT = "When this creature dies, create a 1/1 colorless Thopter artifact creature token with flying.";

export default defineCard({
  name: "Thopter Mechanic",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 1,
  text: `${DRAW_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Thopter Token", count: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
