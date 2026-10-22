import { defineCard } from "../define.js";

const TEXT = "Whenever you cycle or discard a card, you may pay {1}. If you do, put a -1/-1 counter on target creature.";

export default defineCard({
  name: "Ruthless Sniper",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Archer"],
  power: 1,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "discards", who: "you", perCard: true },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Pay {1} to put a -1/-1 counter on the target creature?",
        cost: "{1}",
        effect: { kind: "add-counter", target: 0, counter: "-1/-1", amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
