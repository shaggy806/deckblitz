import { defineCard } from "../define.js";

const FACES = ["Insult // Injury", "Insult", "Injury"];

export default defineCard({
  name: "Insult // Injury",
  manaCost: "{2}{R}{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Damage can't be prevented this turn. If a source you control would deal damage this turn, it deals double that damage instead.\n//\nAftermath (Cast this spell only from your graveyard. Then exile it.)\nInjury deals 2 damage to target creature and 2 damage to target player or planeswalker.",
  faces: FACES,
  split: true,
});
