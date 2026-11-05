import { defineCard } from "../define.js";

export default defineCard({
  name: "Mindleech Ghoul",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 2,
  text: "Exploit (When this creature enters, you may sacrifice a creature.)\nWhen this creature exploits a creature, each opponent exiles a card from their hand.",
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
      effect: {
        kind: "for-each-player",
        who: "each-opponent",
        effect: {
          kind: "look-and-choose",
          player: "that-player",
          zone: "hand",
          min: 1,
          max: 1,
          destination: "exile",
          unlinked: true,
          leftover: "stay",
        },
      },
      resolve: null,
      text: "When this creature exploits a creature, each opponent exiles a card from their hand.",
    },
  ],
});
