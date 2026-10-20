import { defineCard } from "../define.js";

// EDHREC rank 25993.

export default defineCard({
  name: "Diver Skaab",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 3,
  toughness: 5,
  text: "Exploit (When this creature enters, you may sacrifice a creature.)\nWhen this creature exploits a creature, target creature's owner puts it on their choice of the top or bottom of their library.",
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
      targets: ["creature"],
      effect: { kind: "put-on-library", target: 0, position: { ownerChooses: ["top", "bottom"] } },
      resolve: null,
      text: "When this creature exploits a creature, target creature's owner puts it on their choice of the top or bottom of their library.",
    },
  ],
});
