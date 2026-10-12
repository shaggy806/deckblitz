import { defineCard } from "../define.js";

export default defineCard({
  name: "Unflinching Hortimancer",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 1,
  text: "Ward {1} (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {1}.)\nWhenever you gain life, put a +1/+1 counter on this creature.",
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { mana: "{1}" } },
      resolve: null,
      text: "Ward {1}",
    },
    {
      trigger: { on: "gains-life", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever you gain life, put a +1/+1 counter on this creature.",
    },
  ],
});
