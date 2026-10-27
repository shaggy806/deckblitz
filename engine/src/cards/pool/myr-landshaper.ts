import { defineCard } from "../define.js";

// Darksteel. EDHREC rank 17281. Liquimetal Coating's ability, lands only; the
// land keeps its other types and supertypes (the ruling).

export default defineCard({
  name: "Myr Landshaper",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Myr"],
  power: 1,
  toughness: 1,
  text: "{T}: Target land becomes an artifact in addition to its other types until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["land"],
      effect: { kind: "add-types", target: 0, addTypes: ["artifact"], duration: "end-of-turn" },
      resolve: null,
      text: "{T}: Target land becomes an artifact in addition to its other types until end of turn.",
    },
  ],
});
