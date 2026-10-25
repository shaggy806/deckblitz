import { defineCard } from "../define.js";

// EDHREC rank 29010.

export default defineCard({
  name: "Silumgar Butcher",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Djinn"],
  power: 3,
  toughness: 3,
  text: "Exploit (When this creature enters, you may sacrifice a creature.)\nWhen this creature exploits a creature, target creature gets -3/-3 until end of turn.",
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
      effect: { kind: "modify-pt", target: 0, power: -3, toughness: -3, duration: "end-of-turn" },
      resolve: null,
      text: "When this creature exploits a creature, target creature gets -3/-3 until end of turn.",
    },
  ],
});
