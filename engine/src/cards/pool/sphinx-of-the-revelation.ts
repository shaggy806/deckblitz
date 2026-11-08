import { defineCard } from "../define.js";

export default defineCard({
  name: "Sphinx of the Revelation",
  manaCost: "{3}{W}{U}",
  colors: ["W", "U"],
  types: ["artifact", "creature"],
  subtypes: ["Sphinx"],
  power: 4,
  toughness: 5,
  keywords: ["flying", "lifelink"],
  text: "Flying, lifelink\nWhenever you gain life, you get that many {E} (energy counters).\n{W}{U}{U}, {T}, Pay X {E}: Draw X cards.",
  triggered: [
    {
      trigger: { on: "gains-life", who: "you" },
      targets: [],
      effect: { kind: "get-energy", amount: { triggerValue: true } },
      resolve: null,
      text: "Whenever you gain life, you get that many {E} (energy counters).",
    },
  ],
  activated: [
    {
      cost: { mana: "{W}{U}{U}", tap: true, do: { kind: "pay-energy", amount: "x" } },
      targets: [],
      effect: { kind: "draw", amount: "x" },
      resolve: null,
      text: "{W}{U}{U}, {T}, Pay X {E}: Draw X cards.",
    },
  ],
});
