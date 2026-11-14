import { defineCard } from "../define.js";

export default defineCard({
  name: "Draco",
  manaCost: "{16}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Dragon"],
  power: 9,
  toughness: 9,
  keywords: ["flying"],
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { product: [{ basicLandTypes: "you" }, 2] },
  },
  text:
    "Domain — This spell costs {2} less to cast for each basic land type among lands you control.\nFlying\nDomain — At the beginning of your upkeep, sacrifice this creature unless you pay {10}. This cost is reduced by {2} for each basic land type among lands you control.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ payReduced: "{10}", reducedBy: { product: [{ basicLandTypes: "you" }, 2] }, text: "Pay {X}" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: "Domain — At the beginning of your upkeep, sacrifice this creature unless you pay {10}. This cost is reduced by {2} for each basic land type among lands you control.",
    },
  ],
});
