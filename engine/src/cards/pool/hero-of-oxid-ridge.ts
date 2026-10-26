import { defineCard } from "../define.js";

// Rulings: power is checked as blockers are declared, and creatures that
// enter later are bound too — a `restrict` with a `filter` is a rule for the
// rest of the turn, read live (rule 611.2c).

export default defineCard({
  name: "Hero of Oxid Ridge",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 4,
  toughness: 2,
  keywords: ["haste"],
  text: "Haste\nBattle cry (Whenever this creature attacks, each other attacking creature gets +1/+0 until end of turn.)\nWhenever this creature attacks, creatures with power 1 or less can't block this turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", attacking: true },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
        exceptSource: true,
      },
      resolve: null,
      text: "Battle cry",
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "restrict",
        filter: { type: "creature", power: { op: "lte", n: 1 } },
        restrictions: ["cant-block"],
      },
      resolve: null,
      text: "Whenever this creature attacks, creatures with power 1 or less can't block this turn.",
    },
  ],
});
