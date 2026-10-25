import { defineCard } from "../define.js";

// Kaladesh (KLD). EDHREC rank 20551.
//
// The {1} is offered once, as the trigger resolves (the rulings).
const TRIGGER_TEXT =
  "Whenever a creature you control enters, you may pay {1}. If you do, put a +1/+1 counter on that creature.";

export default defineCard({
  name: "Durable Handicraft",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${TRIGGER_TEXT}\n{5}{G}, Sacrifice this enchantment: Put a +1/+1 counter on each creature you control.`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} to put a +1/+1 counter on that creature?",
        cost: "{1}",
        effect: { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{5}{G}", tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you" },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: "{5}{G}, Sacrifice this enchantment: Put a +1/+1 counter on each creature you control.",
    },
  ],
});
