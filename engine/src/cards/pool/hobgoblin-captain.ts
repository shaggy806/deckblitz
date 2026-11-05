import { defineCard } from "../define.js";

// EDHREC rank 19772.

export default defineCard({
  name: "Hobgoblin Captain",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Barbarian"],
  power: 3,
  toughness: 1,
  text: "Pack tactics — Whenever this creature attacks, if you attacked with creatures with total power 6 or greater this combat, this creature gains first strike until end of turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "grant-keyword",
        target: "source",
        keyword: "first-strike",
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Pack tactics — Whenever this creature attacks, if you attacked with creatures with total power 6 or greater this combat, this creature gains first strike until end of turn.",
      condition: { kind: "turn-stat", stat: "power-attacked-with-this-combat", who: "you", atLeast: 6 },
    },
  ],
});
