import { defineCard } from "../define.js";

export default defineCard({
  name: "Indebted Samurai",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Samurai"],
  power: 2,
  toughness: 3,
  text: "Bushido 1 (Whenever this creature blocks or becomes blocked, it gets +1/+1 until end of turn.)\nWhenever a Samurai you control dies, you may put a +1/+1 counter on this creature.",
  triggered: [
    {
      trigger: { on: "blocks", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Bushido 1 (Whenever this creature blocks or becomes blocked, it gets +1/+1 until end of turn.)",
    },
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Bushido 1 (Whenever this creature blocks or becomes blocked, it gets +1/+1 until end of turn.)",
    },
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature", subtype: "Samurai" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a +1/+1 counter on Indebted Samurai?",
        effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: "Whenever a Samurai you control dies, you may put a +1/+1 counter on this creature.",
    },
  ],
});
