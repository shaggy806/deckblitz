import { defineCard } from "../define.js";

// EDHREC rank 24358.

export default defineCard({
  name: "Moriok Rigger",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue", "Rigger"],
  power: 2,
  toughness: 2,
  text: "Whenever an artifact is put into a graveyard from the battlefield, you may put a +1/+1 counter on this creature.",
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "artifact" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a +1/+1 counter on Moriok Rigger?",
        effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: "Whenever an artifact is put into a graveyard from the battlefield, you may put a +1/+1 counter on this creature.",
    },
  ],
});
