import { defineCard } from "../define.js";

export default defineCard({
  name: "Rootgrapple",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["kindred", "instant"],
  subtypes: ["Treefolk"],
  text: "Destroy target noncreature permanent. If you control a Treefolk, draw a card.",
  targets: [{ kind: "permanent", filter: { notTypes: ["creature"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "controls", filter: { subtype: "Treefolk" }, atLeast: 1 },
        then: { kind: "draw", amount: 1 },
      },
    ],
  },
});
