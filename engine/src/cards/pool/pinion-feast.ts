import { defineCard } from "../define.js";

// EDHREC rank 29773.

export default defineCard({
  name: "Pinion Feast",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Destroy target creature with flying. Bolster 2. (Choose a creature with the least toughness among creatures you control and put two +1/+1 counters on it.)",
  targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
  effect: {
    kind: "sequence",
    effects: [{ kind: "destroy", target: 0 }, { kind: "bolster", amount: 2 }],
  },
});
