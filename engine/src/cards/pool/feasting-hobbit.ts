import { defineCard } from "../define.js";

// "Devour Food 3" (rule 702.82b): any Food artifact, token or not.

const EVADE_TEXT = "Creatures with power less than this creature's power can't block it.";

export default defineCard({
  name: "Feasting Hobbit",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Halfling", "Citizen"],
  power: 2,
  toughness: 2,
  text: `Devour Food 3 (As this creature enters, you may sacrifice any number of Foods. It enters with three times that many +1/+1 counters on it.)\n${EVADE_TEXT}`,
  devour: { multiplier: 3, filter: { type: "artifact", subtype: "Food" } },
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { power: { op: "lt", n: { amount: { powerOf: "source" } } } },
      text: EVADE_TEXT,
    },
  ],
});
