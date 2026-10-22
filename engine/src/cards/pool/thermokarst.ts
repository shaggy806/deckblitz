import { defineCard } from "../define.js";

// Ice Age. EDHREC rank 27013.
//
// "If that land was a snow land" reads the target as it last existed once it
// has been destroyed (rule 608.2h), and as it is if it survived.

export default defineCard({
  name: "Thermokarst",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Destroy target land. If that land was a snow land, you gain 1 life.",
  targets: ["land"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { supertype: "snow" } },
        then: { kind: "gain-life", amount: 1 },
      },
    ],
  },
});
