import { defineCard } from "../define.js";

const STATIC_TEXT = "You don't lose the game for having 0 or less life.";
const STATE_TEXT = "When you have 20 or more life, you lose the game.";
const LIFE_TEXT = "Whenever you lose life, you gain 2 life for each 1 life you lost. (Damage dealt to you causes you to lose life.)";

export default defineCard({
  name: "Transcendence",
  manaCost: "{3}{W}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${STATIC_TEXT}\n${STATE_TEXT}\n${LIFE_TEXT}`,
  static: [{ affects: { scope: "self" }, prohibits: [{ act: "lose-game", who: "you", only: "zero-life" }], text: STATIC_TEXT }],
  triggered: [
    {
      trigger: { on: "state", state: { kind: "life-total", atLeast: 20 } },
      targets: [],
      effect: { kind: "lose-game" },
      resolve: null,
      text: STATE_TEXT,
    },
    {
      trigger: { on: "loses-life", who: "you" },
      targets: [],
      effect: { kind: "gain-life", amount: { product: [{ triggerValue: true }, 2] } },
      resolve: null,
      text: LIFE_TEXT,
    },
  ],
});
