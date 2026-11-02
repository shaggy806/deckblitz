import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of your end step, create a 1/1 green Insect creature token for each +1/+1 counter you've put on creatures under your control this turn.";

export default defineCard({
  name: "Iridescent Hornbeetle",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 3,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Insect Token",
        count: { countersPutThisTurn: { counter: "+1/+1", onType: "creature", onYours: true } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
