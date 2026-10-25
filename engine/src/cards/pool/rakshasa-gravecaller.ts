import { defineCard } from "../define.js";

// EDHREC rank 24404.
// Makes Zombie → use "Zombie Token".

export default defineCard({
  name: "Rakshasa Gravecaller",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 3,
  toughness: 6,
  text: "Exploit (When this creature enters, you may sacrifice a creature.)\nWhen this creature exploits a creature, create two 2/2 black Zombie creature tokens.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exploit: sacrifice a creature?",
        effect: {
          kind: "sacrifice",
          who: "you",
          filter: { type: "creature" },
          count: 1,
          exploit: true,
        },
      },
      resolve: null,
      text: "Exploit",
    },
    {
      trigger: { on: "exploits", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Zombie Token", count: 2 },
      resolve: null,
      text: "When this creature exploits a creature, create two 2/2 black Zombie creature tokens.",
    },
  ],
});
