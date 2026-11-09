import { defineCard } from "../define.js";

export default defineCard({
  name: "Lich's Tomb",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: "You don't lose the game for having 0 or less life.\nWhenever you lose life, sacrifice a permanent for each 1 life you lost. (Damage causes loss of life.)",
  static: [
    { affects: { scope: "self" }, prohibits: [{ act: "lose-game", who: "you", only: "zero-life" }], text: "You don't lose the game for having 0 or less life." },
  ],
  triggered: [
    {
      trigger: { on: "loses-life", who: "you" },
      targets: [],
      effect: { kind: "repeat", times: { triggerValue: true }, effect: { kind: "sacrifice", who: "you", filter: {}, count: 1 } },
      resolve: null,
      text: "Whenever you lose life, sacrifice a permanent for each 1 life you lost. (Damage causes loss of life.)",
    },
  ],
});
