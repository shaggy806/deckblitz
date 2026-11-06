import { defineCard } from "../define.js";

// Star Trek Commander (TRC).

const TEXT =
  "Whenever this creature attacks, add one mana of any color. Until end of turn, you don't lose this mana as steps and phases end.";

export default defineCard({
  name: "Qo'noS Quartermaster",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Klingon", "Warrior"],
  power: 2,
  toughness: 2,
  keywords: ["menace"],
  text: `Menace\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1, persists: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
