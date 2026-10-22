import { defineCard } from "../define.js";

// "If that permanent was a Liliana planeswalker" reads the target as it last
// existed once it's destroyed (rule 608.2h), and "her controller" is that
// permanent's last controller.

export default defineCard({
  name: "Liliana's Defeat",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy target black creature or black planeswalker. If that permanent was a Liliana planeswalker, her controller loses 3 life.",
  targets: [{ kind: "permanent", whose: "any", filter: { colors: ["B"], typesAnyOf: ["creature", "planeswalker"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { type: "planeswalker", subtype: "Liliana" } },
        then: { kind: "lose-life", amount: 3, toControllerOfTarget: 0 },
      },
    ],
  },
});
