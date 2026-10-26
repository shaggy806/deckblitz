import { defineCard } from "../define.js";

export default defineCard({
  name: "Ring of Gix",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "Echo {3} (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)\n{1}, {T}: Tap target artifact, creature, or land.",
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "creature", "land"] } }],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "{1}, {T}: Tap target artifact, creature, or land.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "source-came-under-control-since-last-upkeep" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ pay: "{3}", text: "Pay {3}" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: "Echo {3} (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)",
    },
  ],
});
