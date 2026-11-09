import { defineCard } from "../define.js";

const DISCARDED =
  "When a spell or ability an opponent controls causes you to discard this card, return this card from your graveyard to the battlefield with a +1/+1 counter on it at the beginning of the next end step.";

export default defineCard({
  name: "Sand Golem",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 3,
  toughness: 3,
  text: DISCARDED,
  triggered: [
    {
      trigger: { on: "this-discarded", byOpponent: true },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { step: "end" },
        effect: { kind: "put-onto-battlefield", target: "source", withCounters: { kind: "+1/+1", amount: 1 } },
        text: "Return Sand Golem from your graveyard to the battlefield with a +1/+1 counter on it.",
      },
      resolve: null,
      text: DISCARDED,
    },
  ],
});
