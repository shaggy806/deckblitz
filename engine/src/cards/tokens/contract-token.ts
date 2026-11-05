import { defineCard } from "../define.js";

const TEXT =
  "Whenever enchanted creature attacks, it gets +2/+0 until end of turn if it's attacking one of your opponents. Otherwise, its controller loses 2 life.";

// Scriv, the Obligator's Contract. "Your opponents" are the Contract's
// controller's: the filter is read from this ability's controller's side.
export default defineCard({
  name: "Contract Token",
  art: "4c5e0caa-a043-41de-acbf-cdf3a6b6ab18",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "trigger-object", filter: { attackingOpponent: true } },
        then: { kind: "modify-pt", target: "trigger-object", power: 2, toughness: 0, duration: "end-of-turn" },
        else: { kind: "lose-life", amount: 2, who: "trigger-controller" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
