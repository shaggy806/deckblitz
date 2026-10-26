import { defineCard } from "../define.js";

export default defineCard({
  name: "Treasury Thrull",
  manaCost: "{4}{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Thrull"],
  power: 4,
  toughness: 4,
  text: "Extort (Whenever you cast a spell, you may pay {W/B}. If you do, each opponent loses 1 life and you gain that much life.)\nWhenever this creature attacks, you may return target artifact, creature, or enchantment card from your graveyard to your hand.",
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
    {
      trigger: { on: "attacks", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { typesAnyOf: ["artifact", "creature", "enchantment"] },
        },
      ],
      effect: {
        kind: "may",
        prompt: "Return target artifact, creature, or enchantment card from your graveyard to your hand?",
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      resolve: null,
      text: "Whenever this creature attacks, you may return target artifact, creature, or enchantment card from your graveyard to your hand.",
    },
  ],
});
