import { defineCard } from "../define.js";

// EDHREC rank 14700. Foundry of the Consuls' shape, with the Gargoyle.

export default defineCard({
  name: "Gargoyle Castle",
  colors: [],
  types: ["land"],
  text: "{T}: Add {C}.\n{5}, {T}, Sacrifice this land: Create a 3/4 colorless Gargoyle artifact creature token with flying.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{5}", tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Gargoyle Token", count: 1 },
      resolve: null,
      text: "{5}, {T}, Sacrifice this land: Create a 3/4 colorless Gargoyle artifact creature token with flying.",
    },
  ],
});
