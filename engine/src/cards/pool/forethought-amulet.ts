import { defineCard } from "../define.js";

const UPKEEP = "At the beginning of your upkeep, sacrifice this artifact unless you pay {3}.";
const CAP = "If an instant or sorcery source would deal 3 or more damage to you, it deals 2 damage to you instead.";

export default defineCard({
  name: "Forethought Amulet",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: `${UPKEEP}\n${CAP}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "unless", chooser: "you", options: [{ pay: "{3}", text: "Pay {3}" }], otherwise: { kind: "sacrifice-source" } },
      resolve: null,
      text: UPKEEP,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", to: "you", ifAtLeast: 3, source: { typesAnyOf: ["instant", "sorcery"] }, instead: { modify: { set: 2 } } },
      text: CAP,
    },
  ],
});
