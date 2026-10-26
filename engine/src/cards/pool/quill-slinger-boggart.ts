import { defineCard } from "../define.js";

// Lorwyn (LRW). EDHREC rank 31860.
const TEXT = "Whenever a player casts a Kithkin spell, you may have target player lose 1 life.";

export default defineCard({
  name: "Quill-Slinger Boggart",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { subtype: "Kithkin" } },
      targets: ["player"],
      effect: {
        kind: "may",
        prompt: "Have target player lose 1 life?",
        effect: { kind: "lose-life", amount: 1, target: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
