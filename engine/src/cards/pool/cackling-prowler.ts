import { defineCard } from "../define.js";

export default defineCard({
  name: "Cackling Prowler",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Hyena", "Rogue"],
  power: 4,
  toughness: 3,
  text: "Ward {2} (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {2}.)\nMorbid — At the beginning of your end step, if a creature died this turn, put a +1/+1 counter on this creature.",
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { mana: "{2}" } },
      resolve: null,
      text: "Ward {2}",
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Morbid — At the beginning of your end step, if a creature died this turn, put a +1/+1 counter on this creature.",
      condition: { kind: "creature-died-this-turn" },
    },
  ],
});
