import { defineCard } from "../define.js";

// EDHREC rank 22917. "Target Elephant" is any permanent with that subtype.

export default defineCard({
  name: "Elephant Graveyard",
  colors: [],
  types: ["land"],
  text: "{T}: Add {C}.\n{T}: Regenerate target Elephant.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { subtype: "Elephant" } }],
      effect: { kind: "regenerate", target: 0 },
      resolve: null,
      text: "{T}: Regenerate target Elephant.",
    },
  ],
});
