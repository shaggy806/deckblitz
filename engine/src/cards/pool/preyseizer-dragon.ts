import { defineCard } from "../define.js";

// The counters are counted as the ability resolves, any +1/+1 counters, not
// only devour's (the ruling).
const ATTACK_TEXT =
  "Whenever this creature attacks, it deals damage to any target equal to the number of +1/+1 counters on this creature.";

export default defineCard({
  name: "Preyseizer Dragon",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  devour: { multiplier: 2, filter: { type: "creature" } },
  text: `Flying\nDevour 2 (As this creature enters, you may sacrifice any number of creatures. It enters with twice that many +1/+1 counters on it.)\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: { countersOn: "source", counter: "+1/+1" }, target: 0 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
