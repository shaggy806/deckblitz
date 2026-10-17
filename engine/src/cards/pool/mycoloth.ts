import { defineCard } from "../define.js";

// Makes Saproling → "Saproling Token".

const UPKEEP_TEXT =
  "At the beginning of your upkeep, create a 1/1 green Saproling creature token for each +1/+1 counter on this creature.";

export default defineCard({
  name: "Mycoloth",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Fungus"],
  power: 4,
  toughness: 4,
  text: `Devour 2 (As this creature enters, you may sacrifice any number of creatures. It enters with twice that many +1/+1 counters on it.)\n${UPKEEP_TEXT}`,
  devour: { multiplier: 2, filter: { type: "creature" } },
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Saproling Token",
        count: { countersOn: "source", counter: "+1/+1" },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
