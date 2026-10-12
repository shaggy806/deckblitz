import { defineCard } from "../define.js";

// EDHREC rank 13150.
//
// "During an opponent's turn" is any turn but yours (Unwelcome Sprite's shape).

const TEXT = "Whenever you cast a spell during an opponent's turn, put a -1/-1 counter on up to one target creature.";

export default defineCard({
  name: "Nightmare Sower",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Faerie", "Assassin"],
  power: 2,
  toughness: 3,
  keywords: ["flying", "lifelink"],
  text: `Flying, lifelink\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you" },
      condition: { kind: "not", of: { kind: "your-turn" } },
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "add-counter", target: 0, counter: "-1/-1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
