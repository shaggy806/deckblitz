import { defineCard } from "../define.js";

// Star Trek Commander (TRC).

const ETB_TEXT =
  "Strange new worlds — When Christine Chapel enters, you gain life equal to the number of differently named lands you control.";
const LIFE_TEXT = "Whenever you gain life, put two +1/+1 counters on Christine Chapel.";

export default defineCard({
  name: "Christine Chapel, Combat Medic",
  manaCost: "{3}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Doctor"],
  power: 2,
  toughness: 2,
  text: `${ETB_TEXT}\n${LIFE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "gain-life",
        amount: { aggregate: "distinct", of: "name", filter: { type: "land", controlledBy: "you" } },
      },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: { on: "gains-life", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
      resolve: null,
      text: LIFE_TEXT,
    },
  ],
});
