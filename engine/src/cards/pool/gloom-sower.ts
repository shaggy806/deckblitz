import { defineCard } from "../define.js";

// Once per blocking creature (Vicious Battlerager's trigger); "that
// creature's controller" is its controller as it last was, should it have
// left by resolution (the ruling).
const TEXT =
  "Whenever this creature becomes blocked by a creature, that creature's controller loses 2 life and you gain 2 life.";

export default defineCard({
  name: "Gloom Sower",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 8,
  toughness: 6,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "blocked-by", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", who: "trigger-controller", amount: 2 },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
