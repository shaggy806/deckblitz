import { defineCard } from "../define.js";

export default defineCard({
  name: "Defibrillating Current",
  manaCost: "{2/R}{2/W}{2/B}",
  colors: ["W", "B", "R"],
  types: ["sorcery"],
  text: "Defibrillating Current deals 4 damage to target creature or planeswalker and you gain 2 life.",
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: {
    kind: "sequence",
    effects: [{ kind: "damage", amount: 4, target: 0 }, { kind: "gain-life", amount: 2 }],
  },
});
