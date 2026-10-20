import { defineCard } from "../define.js";

// EDHREC rank 20806.
// Makes Zombie → use "Zombie Token".

export default defineCard({
  name: "Skull Skaab",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 2,
  text: "Exploit (When this creature enters, you may sacrifice a creature.)\nWhenever a creature you control exploits a nontoken creature, create a 2/2 black Zombie creature token.",
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
      trigger: { on: "exploits", who: "you-control", filter: { type: "creature", token: false } },
      targets: [],
      effect: { kind: "create-token", token: "Zombie Token", count: 1 },
      resolve: null,
      text: "Whenever a creature you control exploits a nontoken creature, create a 2/2 black Zombie creature token.",
    },
  ],
});
