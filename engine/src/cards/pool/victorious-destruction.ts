import { defineCard } from "../define.js";

export default defineCard({
  name: "Victorious Destruction",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy target artifact or land. Its controller loses 1 life.",
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "land"] } }],
  effect: {
    kind: "sequence",
    effects: [{ kind: "destroy", target: 0 }, { kind: "lose-life", amount: 1, toControllerOfTarget: 0 }],
  },
});
