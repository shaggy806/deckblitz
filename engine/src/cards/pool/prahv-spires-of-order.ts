import { defineCard } from "../define.js";

// All of that source's damage this turn, to anything (rule 609.7).

export default defineCard({
  name: "Prahv, Spires of Order",
  colors: [],
  types: ["land"],
  text: "{T}: Add {C}.\n{4}{W}{U}, {T}: Prevent all damage a source of your choice would deal this turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{4}{W}{U}", tap: true },
      targets: [],
      effect: { kind: "prevent-damage-from-chosen-source", to: "any", amount: "all" },
      resolve: null,
      text: "{4}{W}{U}, {T}: Prevent all damage a source of your choice would deal this turn.",
    },
  ],
});
