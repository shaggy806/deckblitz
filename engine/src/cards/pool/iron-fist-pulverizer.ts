import { defineCard } from "../define.js";

// EDHREC rank 20248. Ruling: spells cast before it entered count toward
// "your second spell each turn" (`nthEachTurn` reads the turn's casts).
const TRIGGER_TEXT =
  "Whenever you cast your second spell each turn, this creature deals 2 damage to target opponent. Scry 1.";

export default defineCard({
  name: "Iron-Fist Pulverizer",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant", "Warrior"],
  power: 4,
  toughness: 5,
  keywords: ["reach"],
  text: "Reach\nWhenever you cast your second spell each turn, this creature deals 2 damage to target opponent. Scry 1. (Look at the top card of your library. You may put that card on the bottom.)",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", nthEachTurn: 2 },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 2, target: 0 },
          { kind: "scry", amount: 1 },
        ],
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
