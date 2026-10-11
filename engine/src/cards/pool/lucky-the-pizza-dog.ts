import { defineCard } from "../define.js";

// EDHREC rank 15901.

const FOOD_TEXT =
  'Whenever you cast a Cat, Dog, or Hero spell, create a Food token. (It\'s an artifact with "{2}, {T}, Sacrifice this token: You gain 3 life.")';
const END_TEXT = "At the beginning of each end step, if you gained life this turn, put a +1/+1 counter on Lucky.";

export default defineCard({
  name: "Lucky the Pizza Dog",
  manaCost: "{1}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dog"],
  power: 2,
  toughness: 2,
  text: `${FOOD_TEXT}\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { subtypes: ["Cat", "Dog", "Hero"] } },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 1 },
      resolve: null,
      text: FOOD_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "turn-stat", stat: "life-gained", who: "you", atLeast: 1 },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
