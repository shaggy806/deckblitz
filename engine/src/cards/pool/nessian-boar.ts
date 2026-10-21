import { defineCard } from "../define.js";

const LURE = "All creatures able to block this creature do so.";
const DRAW = "Whenever this creature becomes blocked by a creature, that creature's controller draws a card.";

export default defineCard({
  name: "Nessian Boar",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Boar"],
  power: 10,
  toughness: 6,
  text: `${LURE}\n${DRAW}`,
  static: [{ affects: { scope: "self" }, restrictions: ["must-be-blocked"], text: LURE }],
  triggered: [
    {
      // Once per blocker (the ruling); "that creature's controller" is the blocker's.
      trigger: { on: "blocked-by", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1, who: "trigger-controller" },
      resolve: null,
      text: DRAW,
    },
  ],
});
