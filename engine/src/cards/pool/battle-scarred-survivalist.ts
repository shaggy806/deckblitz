import { defineCard } from "../define.js";


export default defineCard({
  name: "Battle-Scarred Survivalist",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Klingon", "Scout"],
  power: 1,
  toughness: 1,
  keywords: ["menace"],
  text: "Menace (This creature can't be blocked except by two or more creatures.)\nWhenever another creature dies, put a +1/+1 counter on this creature. This ability triggers only once each turn.",
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever another creature dies, put a +1/+1 counter on this creature. This ability triggers only once each turn.",
      oncePerTurn: true,
    },
  ],
});
