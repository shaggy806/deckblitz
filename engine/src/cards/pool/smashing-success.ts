import { defineCard } from "../define.js";

// EDHREC rank 15095.
// Makes Treasure → "Treasure Token".
//
// Only a permanent actually destroyed counts: an indestructible or
// regenerated artifact makes no Treasure, nor does a land that isn't an
// artifact.
export default defineCard({
  name: "Smashing Success",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Destroy target artifact or land. If an artifact is destroyed this way, create a Treasure token. (It's an artifact with \"{T}, Sacrifice this token: Add one mana of any color.\")",
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "land"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "destroyed", filter: { type: "artifact" }, atLeast: 1 },
        then: { kind: "create-token", token: "Treasure Token", count: 1 },
      },
    ],
  },
});
