import { defineCard } from "../define.js";

const ATTACK_TEXT =
  "Whenever a creature attacks, you may pay {3}. When you do, put a +1/+1 counter on that creature.";

export default defineCard({
  name: "Anointer of Valor",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 3,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${ATTACK_TEXT}`,
  triggered: [
    {
      // Any creature, attacking any player or planeswalker (the ruling).
      trigger: { on: "attacks", who: "any", filter: { type: "creature" } },
      targets: [],
      // Paid once at most; the counter waits on a reflexive trigger players
      // may respond to (the rulings). "That creature" is the trigger object.
      effect: {
        kind: "may",
        prompt: "Pay {3} to put a +1/+1 counter on that creature?",
        cost: "{3}",
        effect: {
          kind: "reflexive-trigger",
          targets: [],
          effect: { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 1 },
          text: "When you do, put a +1/+1 counter on that creature.",
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
