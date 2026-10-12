import { defineCard } from "../define.js";

export default defineCard({
  name: "Tithe Drinker",
  manaCost: "{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 2,
  toughness: 1,
  keywords: ["lifelink"],
  text: "Lifelink (Damage dealt by this creature also causes you to gain that much life.)\nExtort (Whenever you cast a spell, you may pay {W/B}. If you do, each opponent loses 1 life and you gain that much life.)",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {W/B} to extort?",
        cost: "{W/B}",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "lose-life", amount: 1, who: "each-opponent" },
            { kind: "gain-life", amount: { lifeLostThisWay: true, who: "each-opponent" } },
          ],
        },
      },
      resolve: null,
      text: "Extort",
    },
  ],
});
