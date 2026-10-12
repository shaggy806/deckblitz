import { defineCard } from "../define.js";

export default defineCard({
  name: "Fell the Pheasant",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Fell the Pheasant deals 5 damage to target creature with flying. Create a Food token. (It's an artifact with \"{2}, {T}, Sacrifice this token: You gain 3 life.\")",
  targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 5, target: 0 },
      { kind: "create-token", token: "Food Token", count: 1 },
    ],
  },
});
