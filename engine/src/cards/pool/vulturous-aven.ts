import { defineCard } from "../define.js";

const EXPLOITS_TEXT = "When this creature exploits a creature, you draw two cards and you lose 2 life.";

export default defineCard({
  name: "Vulturous Aven",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Bird", "Shaman"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\nExploit (When this creature enters, you may sacrifice a creature.)\n${EXPLOITS_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exploit: sacrifice a creature?",
        effect: { kind: "sacrifice", who: "you", filter: { type: "creature" }, count: 1, exploit: true },
      },
      resolve: null,
      text: "Exploit (When this creature enters, you may sacrifice a creature.)",
    },
    {
      trigger: { on: "exploits", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2 },
          { kind: "lose-life", amount: 2 },
        ],
      },
      resolve: null,
      text: EXPLOITS_TEXT,
    },
  ],
});
