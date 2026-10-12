import { defineCard } from "../define.js";

export default defineCard({
  name: "Wardens of the Cycle",
  manaCost: "{1}{B}{G}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Elf", "Warlock"],
  power: 3,
  toughness: 4,
  text: "Morbid — At the beginning of your end step, if a creature died this turn, choose one —\n• You gain 2 life.\n• You draw a card and you lose 1 life.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "You gain 2 life.", effect: { kind: "gain-life", amount: 2 } },
          {
            text: "You draw a card and you lose 1 life.",
            effect: {
              kind: "sequence",
              effects: [{ kind: "draw", amount: 1 }, { kind: "lose-life", amount: 1 }],
            },
          },
        ],
      },
      resolve: null,
      text: "Morbid — At the beginning of your end step, if a creature died this turn, choose one —",
      condition: { kind: "creature-died-this-turn" },
    },
  ],
});
