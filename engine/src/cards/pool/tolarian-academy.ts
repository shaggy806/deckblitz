import { defineCard } from "../define.js";

// Gaea's Cradle's shape: a live-amount mana ability, counted as it's
// activated. With no artifacts it adds nothing.
export default defineCard({
  name: "Tolarian Academy",
  colors: [],
  supertypes: ["legendary"],
  types: ["land"],
  text: "{T}: Add {U} for each artifact you control.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "U",
        amount: { countOf: { type: "artifact", controlledBy: "you" } },
      },
      resolve: null,
      text: "{T}: Add {U} for each artifact you control.",
    },
  ],
});
