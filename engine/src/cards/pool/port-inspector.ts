import { defineCard } from "../define.js";

const TEXT = "Whenever this creature becomes blocked, you may look at defending player's hand.";

export default defineCard({
  name: "Port Inspector",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 1,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Look at defending player's hand?",
        effect: { kind: "look-at-hand", target: { defendingPlayerOf: "source" } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
