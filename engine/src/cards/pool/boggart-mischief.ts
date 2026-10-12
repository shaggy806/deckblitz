import { defineCard } from "../define.js";

// The "you may" isn't offered without a creature to blight (rule 701.68b);
// "if you do" follows the blight.
export default defineCard({
  name: "Boggart Mischief",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["kindred", "enchantment"],
  subtypes: ["Goblin"],
  text: "When this enchantment enters, you may blight 1. If you do, create two 1/1 black and red Goblin creature tokens. (To blight 1, put a -1/-1 counter on a creature you control.)\nWhenever a Goblin creature you control dies, each opponent loses 1 life and you gain 1 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Blight 1?",
        effect: { kind: "blight", amount: 1 },
        then: { kind: "create-token", token: "Goblin Token (Boggart Mischief)", count: 2 },
      },
      resolve: null,
      text: "When this enchantment enters, you may blight 1. If you do, create two 1/1 black and red Goblin creature tokens.",
    },
    {
      trigger: { on: "dies", who: "you-control", filter: { subtype: "Goblin", type: "creature" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, who: "each-opponent" },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: "Whenever a Goblin creature you control dies, each opponent loses 1 life and you gain 1 life.",
    },
  ],
});
