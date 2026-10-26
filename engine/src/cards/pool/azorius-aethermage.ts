import { defineCard } from "../define.js";

// Dissension. Any permanent you own going to your hand — whoever controlled
// it, a token, or this creature itself (the ruling).
const TEXT = "Whenever a permanent is returned to your hand, you may pay {1}. If you do, draw a card.";

export default defineCard({
  name: "Azorius Aethermage",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "any", filter: { ownedBy: "you" }, to: ["hand"] },
      targets: [],
      effect: { kind: "may", prompt: "Pay {1} to draw a card?", cost: "{1}", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: TEXT,
    },
  ],
});
