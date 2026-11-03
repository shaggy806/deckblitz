import { defineCard } from "../define.js";

// Innistrad (ISD). Each Ooze remembers the Gutter Grime that made it and reads its
// slime counters (the rulings), 0 once it has left, so the Ooze dies then.

const TEXT =
  'Whenever a nontoken creature you control dies, put a slime counter on this enchantment, then create a green Ooze creature token with "This token\'s power and toughness are each equal to the number of slime counters on Gutter Grime."';

export default defineCard({
  name: "Gutter Grime",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { token: false, type: "creature", controlledBy: "you" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "slime", amount: 1 },
          { kind: "create-token", token: "Ooze Token (Gutter Grime)", count: 1, linkedToSource: true },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
