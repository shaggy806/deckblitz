import { defineCard } from "../define.js";

export default defineCard({
  name: "Light 'Em Up",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  casualty: 2,
  text:
    "Casualty 2 (As you cast this spell, you may sacrifice a creature with power 2 or greater. When you do, copy this spell and you may choose a new target for the copy.)\n" +
    "Light 'Em Up deals 2 damage to target creature or planeswalker.",
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: { kind: "damage", amount: 2, target: 0 },
});
