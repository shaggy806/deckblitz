import { defineCard } from "../define.js";

export default defineCard({
  name: "Twinblade Assassins",
  manaCost: "{3}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Elf", "Assassin"],
  power: 5,
  toughness: 4,
  text: "At the beginning of your end step, if a creature died this turn, draw a card.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "At the beginning of your end step, if a creature died this turn, draw a card.",
      condition: { kind: "creature-died-this-turn" },
    },
  ],
});
