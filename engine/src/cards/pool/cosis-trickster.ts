import { defineCard } from "../define.js";

// Zendikar. EDHREC rank 15647.

const TEXT = "Whenever an opponent shuffles their library, you may put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Cosi's Trickster",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "event", event: "shuffles-library", who: "opponent" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a +1/+1 counter on Cosi's Trickster?",
        effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
