import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 10828.

const SAC =
  "{4}{S}, {T}, Sacrifice this land: It deals 4 damage to target creature. ({S} can be paid with one mana from a snow source.)";

export default defineCard({
  name: "Mouth of Ronom",
  supertypes: ["snow"],
  types: ["land"],
  text: `{T}: Add {C}.\n${SAC}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{4}{S}", tap: true, sacrifice: "self" },
      targets: ["creature"],
      effect: { kind: "damage", target: 0, amount: 4 },
      resolve: null,
      text: SAC,
    },
  ],
});
