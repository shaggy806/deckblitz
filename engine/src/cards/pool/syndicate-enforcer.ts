import { defineCard } from "../define.js";

export default defineCard({
  name: "Syndicate Enforcer",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 3,
  toughness: 2,
  text: "Extort (Whenever you cast a spell, you may pay {W/B}. If you do, each opponent loses 1 life and you gain that much life.)",
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
