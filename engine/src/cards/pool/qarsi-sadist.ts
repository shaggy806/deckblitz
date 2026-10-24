import { defineCard } from "../define.js";

// EDHREC rank 24341.

export default defineCard({
  name: "Qarsi Sadist",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 3,
  text: "Exploit (When this creature enters, you may sacrifice a creature.)\nWhen this creature exploits a creature, target opponent loses 2 life and you gain 2 life.",
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
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [{ kind: "lose-life", amount: 2, target: 0 }, { kind: "gain-life", amount: 2 }],
      },
      resolve: null,
      text: "When this creature exploits a creature, target opponent loses 2 life and you gain 2 life.",
    },
  ],
});
