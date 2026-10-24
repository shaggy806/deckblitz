import { defineCard } from "../define.js";

// EDHREC rank 20476.

export default defineCard({
  name: "Silumgar Sorcerer",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard", "Sorcerer"],
  power: 2,
  toughness: 1,
  keywords: ["flash", "flying"],
  text: "Flash (You may cast this spell any time you could cast an instant.)\nFlying\nExploit (When this creature enters, you may sacrifice a creature.)\nWhen this creature exploits a creature, counter target creature spell.",
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
      targets: ["creature-spell"],
      effect: { kind: "counter", target: 0 },
      resolve: null,
      text: "When this creature exploits a creature, counter target creature spell.",
    },
  ],
});
