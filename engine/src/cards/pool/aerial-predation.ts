import { defineCard } from "../define.js";

export default defineCard({
  name: "Aerial Predation",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Destroy target creature with flying. You gain 2 life.",
  targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
  effect: {
    kind: "sequence",
    effects: [{ kind: "destroy", target: 0 }, { kind: "gain-life", amount: 2 }],
  },
});
