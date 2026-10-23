import { defineCard } from "../define.js";

export default defineCard({
  name: "Structural Distortion",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Exile target artifact or land. Structural Distortion deals 2 damage to that permanent's controller.",
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "land"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      { kind: "damage", amount: 2, toControllerOfTarget: 0 },
    ],
  },
});
