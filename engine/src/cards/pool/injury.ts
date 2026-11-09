import { defineCard } from "../define.js";

const FACES = ["Insult // Injury", "Insult", "Injury"];

export default defineCard({
  name: "Injury",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Aftermath (Cast this spell only from your graveyard. Then exile it.)\nInjury deals 2 damage to target creature and 2 damage to target player or planeswalker.",
  targets: ["creature", "player-or-planeswalker"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 2, target: 0 },
      { kind: "damage", amount: 2, target: 1 },
    ],
  },
  faces: FACES,
  split: true,
  aftermath: true,
});
