import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 29365.

const TEXT = "{5}, {T}, Exile this artifact: Exile target artifact, creature, or land. Activate only as a sorcery.";

export default defineCard({
  name: "Amulet of Unmaking",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{5}", tap: true, exileSelf: true },
      targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "creature", "land"] } }],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      sorcerySpeed: true,
      text: TEXT,
    },
  ],
});
