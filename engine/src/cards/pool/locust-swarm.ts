import { defineCard } from "../define.js";

export default defineCard({
  name: "Locust Swarm",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\n{G}: Regenerate this creature.\n{G}: Untap this creature. Activate only once each turn.",
  activated: [
    {
      cost: { mana: "{G}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{G}: Regenerate this creature.",
    },
    {
      cost: { mana: "{G}", tap: false },
      targets: [],
      effect: { kind: "untap", target: "source" },
      resolve: null,
      text: "{G}: Untap this creature. Activate only once each turn.",
      oncePerTurn: true,
    },
  ],
});
