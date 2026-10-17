import { defineCard } from "../define.js";

// Makes Pest → "Pest Token".

const END_TEXT =
  'At the beginning of your end step, create a number of 1/1 black and green Pest creature tokens equal to the number of +1/+1 counters on this creature. They have "When this token dies, you gain 1 life."';

export default defineCard({
  name: "Ribtruss Roaster",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Troll", "Druid"],
  power: 3,
  toughness: 3,
  text: `Devour 1 (As this creature enters, you may sacrifice any number of creatures. This creature enters with that many +1/+1 counters on it.)\n${END_TEXT}`,
  devour: { multiplier: 1, filter: { type: "creature" } },
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "create-token", token: "Pest Token", count: { countersOn: "source", counter: "+1/+1" } },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
