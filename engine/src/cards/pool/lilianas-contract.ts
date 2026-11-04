import { defineCard } from "../define.js";

const ETB_TEXT = "When this enchantment enters, you draw four cards and you lose 4 life.";
const WIN_TEXT = "At the beginning of your upkeep, if you control four or more Demons with different names, you win the game.";

export default defineCard({
  name: "Liliana's Contract",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${ETB_TEXT}\n${WIN_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 4 },
          { kind: "lose-life", amount: 4 },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "controls", filter: { subtype: "Demon" }, atLeast: 4, distinctNames: true, countsSelf: true },
      targets: [],
      effect: { kind: "win-game" },
      resolve: null,
      text: WIN_TEXT,
    },
  ],
});
