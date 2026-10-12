import { defineCard } from "../define.js";

// EDHREC rank 13659.
// Makes Goblin → use "Goblin Token (Boggart Mischief)".

export default defineCard({
  name: "Sourbread Auntie",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 4,
  toughness: 3,
  text: "When this creature enters, you may blight 2. If you do, create two 1/1 black and red Goblin creature tokens. (To blight 2, put two -1/-1 counters on a creature you control.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Blight 2?",
        effect: { kind: "blight", amount: 2 },
        then: { kind: "create-token", token: "Goblin Token (Boggart Mischief)", count: 2 },
      },
      resolve: null,
      text: "When this creature enters, you may blight 2. If you do, create two 1/1 black and red Goblin creature tokens.",
    },
  ],
});
