import { defineCard } from "../define.js";

// "Its controller sacrifices another land of their choice": the destroyed
// land's controller as it last existed, choosing among their own lands.
export default defineCard({
  name: "Feast of Worms",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  subtypes: ["Arcane"],
  text: "Destroy target land. If that land was legendary, its controller sacrifices another land of their choice.",
  targets: ["land"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { supertype: "legendary" } },
        then: {
          kind: "as-player",
          who: { controllerOfTarget: 0 },
          effect: { kind: "sacrifice", who: "you", filter: { type: "land" }, count: 1, exceptTarget: 0 },
        },
      },
    ],
  },
});
