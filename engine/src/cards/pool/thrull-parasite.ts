import { defineCard } from "../define.js";

// EDHREC rank 7171.

export default defineCard({
  name: "Thrull Parasite",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Thrull"],
  power: 1,
  toughness: 1,
  text: "Extort (Whenever you cast a spell, you may pay {W/B}. If you do, each opponent loses 1 life and you gain that much life.)\n{T}, Pay 2 life: Remove a counter from target nonland permanent.",
  activated: [
    {
      cost: { mana: null, tap: true, payLife: 2 },
      targets: ["nonland-permanent"],
      effect: { kind: "remove-counters", target: 0, counter: "any", count: 1 },
      resolve: null,
      text: "{T}, Pay 2 life: Remove a counter from target nonland permanent.",
    },
  ],
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
