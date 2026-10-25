import { defineCard } from "../define.js";

// Magic 2015. EDHREC rank 10205.

const TEXT = "{5}, {T}, Exile this artifact: Exile all nonland permanents.";

export default defineCard({
  name: "Perilous Vault",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{5}", tap: true, exileSelf: true },
      targets: [],
      effect: { kind: "exile-all", filter: { notTypes: ["land"] } },
      resolve: null,
      text: TEXT,
    },
  ],
});
