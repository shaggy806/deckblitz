import { defineCard } from "../define.js";

// Scourge (SCG). EDHREC rank 11142.

export default defineCard({
  name: "Krosan Warchief",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 2,
  toughness: 2,
  text: "Beast spells you cast cost {1} less to cast.\n{1}{G}: Regenerate target Beast.",
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { subtype: "Beast" }, caster: "you", reduceGeneric: 1 },
      text: "Beast spells you cast cost {1} less to cast.",
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false },
      targets: [{ kind: "permanent", filter: { subtype: "Beast" } }],
      effect: { kind: "regenerate", target: 0 },
      resolve: null,
      text: "{1}{G}: Regenerate target Beast.",
    },
  ],
});
