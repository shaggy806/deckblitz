import { defineCard } from "../define.js";

// EDHREC rank 7870.
// Makes Phyrexian Goblin → use "Phyrexian Goblin Token".
//
// "If you controlled that artifact" is Boomerang Basics' and Kellan's shape: the target is read
// live if it's still there (an indestructible artifact you control still counts), or as it last
// existed on the battlefield once destroyed.

export default defineCard({
  name: "Gleeful Demolition",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy target artifact. If you controlled that artifact, create three 1/1 red Phyrexian Goblin creature tokens.",
  targets: ["artifact"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { controlledBy: "you" } },
        then: { kind: "create-token", token: "Phyrexian Goblin Token", count: 3 },
      },
    ],
  },
});
